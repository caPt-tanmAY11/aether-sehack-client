import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { paymentsApi } from '../../api/payments.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuthStore } from '../../store/auth.store';

const TYPE_CONFIG = {
  library: { icon: 'library',     color: '#3b82f6', label: 'Library Fine' },
  canteen: { icon: 'restaurant',  color: '#f59e0b', label: 'Canteen Bill' },
  lab:     { icon: 'flask',       color: '#8b5cf6', label: 'Lab Due' },
  other:   { icon: 'receipt',     color: '#64748b', label: 'Other' },
};

const STATUS_STYLE = {
  unpaid:  { bg: 'bg-error/20',   border: 'border-error/50',   text: 'text-error',   icon: 'alert-circle-outline' },
  paid:    { bg: 'bg-success/20', border: 'border-success/50', text: 'text-success', icon: 'checkmark-circle-outline' },
  waived:  { bg: 'bg-muted/20',   border: 'border-border',     text: 'text-muted',   icon: 'remove-circle-outline' },
};

export default function MyDuesScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);

  const [dues, setDues] = useState([]);
  const [history, setHistory] = useState([]);
  const [outstanding, setOutstanding] = useState({ totalRupees: '0.00', count: 0 });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);  // dueId being paid
  const [activeTab, setActiveTab] = useState('unpaid'); // 'unpaid' | 'history'

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [unpaid, hist, bal] = await Promise.all([
        paymentsApi.getDues(),
        paymentsApi.getDueHistory(),
        paymentsApi.getOutstanding(),
      ]);
      setDues(unpaid || []);
      setHistory(hist || []);
      setOutstanding(bal || { totalRupees: '0.00', count: 0 });
    } catch (err) {
      console.error('Failed to fetch dues', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePay = async (due) => {
    try {
      setPaying(due._id);
      const order = await paymentsApi.createOrder(due._id);

      const amountRupees = (due.amount / 100).toFixed(2);
      const options = {
        description: due.description,
        currency: order.currency,
        key: order.keyId,
        amount: order.amount,
        order_id: order.orderId,
        name: 'Aether — Financial Settlement',
        prefill: {
          email: user?.email || '',
          name: user?.name || '',
        },
        theme: { color: '#6366f1' },
      };

      let paymentData;
      // Robust check for native module (will be missing/null in Expo Go)
      if (RazorpayCheckout && typeof RazorpayCheckout.open === 'function') {
        paymentData = await RazorpayCheckout.open(options);
      } else {
        // --- EXPO GO MOCK FLOW ---
        // Since react-native-razorpay doesn't work in Expo Go, we simulate a successful UI flow
        console.warn('RazorpayCheckout is null (likely running in Expo Go). Simulating successful payment...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate UI delay
        paymentData = {
          razorpay_order_id: order.orderId,
          razorpay_payment_id: 'pay_mock_' + Math.floor(Math.random() * 1000000),
          razorpay_signature: 'EXPO_GO_MOCK_SIGNATURE',
        };
      }

      // Verify on server
      await paymentsApi.verifyPayment(due._id, {
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
      });

      Alert.alert('✅ Payment Successful', `₹${amountRupees} paid for "${due.description}". A receipt has been sent to your notifications.`);
      fetchAll();
    } catch (err) {
      if (err?.description?.includes('cancelled')) {
        // User cancelled — do nothing
      } else {
        console.error('PAYMENT ERROR:', err);
        if (err.response) {
          console.error('RESPONSE DATA:', err.response.data);
          console.error('RESPONSE STATUS:', err.response.status);
        }
        Alert.alert('Payment Failed', err?.response?.data?.message || err?.description || 'Payment could not be processed. Please check the console for details.');
      }
    } finally {
      setPaying(null);
    }
  };

  const displayList = activeTab === 'unpaid' ? dues : history;

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">My Dues</Text>
            <Text className="text-muted text-xs">Financial Settlement Gateway</Text>
          </View>
        </View>

        {/* Outstanding balance card */}
        <View className="bg-surface rounded-2xl border border-border p-4 flex-row items-center justify-between">
          <View>
            <Text className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Total Outstanding</Text>
            <Text className="text-white text-3xl font-bold">₹{outstanding.totalRupees}</Text>
            <Text className="text-muted text-xs mt-1">{outstanding.count} unpaid {outstanding.count === 1 ? 'due' : 'dues'}</Text>
          </View>
          <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center">
            <Ionicons name="cash-outline" size={30} color="#ef4444" />
          </View>
        </View>
      </View>

      {/* Tab switcher */}
      <View className="flex-row mx-4 mt-4 mb-2 bg-card rounded-xl p-1 border border-border">
        {['unpaid', 'history'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 items-center rounded-lg ${activeTab === tab ? 'bg-primary' : 'bg-transparent'}`}
          >
            <Text className={`font-bold capitalize ${activeTab === tab ? 'text-white' : 'text-muted'}`}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-4 py-2">
        {loading ? (
          <View className="items-center mt-16">
            <ActivityIndicator color="#6366f1" size="large" />
          </View>
        ) : displayList.length === 0 ? (
          <View className="items-center mt-16">
            <Ionicons name="checkmark-circle-outline" size={56} color="#22c55e" />
            <Text className="text-white font-bold text-lg mt-4">
              {activeTab === 'unpaid' ? 'No Pending Dues!' : 'No History Yet'}
            </Text>
            <Text className="text-muted text-center mt-2">
              {activeTab === 'unpaid' ? 'You\'re all cleared.' : 'Payments will appear here once made.'}
            </Text>
          </View>
        ) : (
          displayList.map((due) => {
            const type = TYPE_CONFIG[due.type] || TYPE_CONFIG.other;
            const statusStyle = STATUS_STYLE[due.status] || STATUS_STYLE.unpaid;
            const isBeingPaid = paying === due._id;

            return (
              <View key={due._id} className="bg-card rounded-2xl border border-border mb-4 overflow-hidden">
                <View className="p-4">
                  <View className="flex-row items-start justify-between mb-3">
                    {/* Type icon */}
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${type.color}22` }}>
                        <Ionicons name={type.icon} size={20} color={type.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-muted text-xs font-bold">{type.label}</Text>
                        <Text className="text-white font-semibold text-sm" numberOfLines={2}>{due.description}</Text>
                      </View>
                    </View>
                    {/* Amount */}
                    <Text className="text-white font-bold text-lg">₹{(due.amount / 100).toFixed(2)}</Text>
                  </View>

                  {/* Meta */}
                  <View className="flex-row items-center flex-wrap gap-2 mb-3">
                    <View className={`flex-row items-center px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.border}`}>
                      <Ionicons name={statusStyle.icon} size={12} color="" />
                      <Text className={`text-xs font-bold ml-1 capitalize ${statusStyle.text}`}>{due.status}</Text>
                    </View>
                    <Text className="text-muted text-xs">Due: {new Date(due.dueDate).toLocaleDateString()}</Text>
                    {due.issuedBy && (
                      <Text className="text-muted text-xs">By: {due.issuedBy.name}</Text>
                    )}
                  </View>

                  {/* Paid info */}
                  {due.status === 'paid' && due.paidAt && (
                    <View className="bg-success/10 border border-success/30 rounded-xl px-3 py-2 mb-2">
                      <Text className="text-success text-xs font-bold">
                        ✅ Paid on {new Date(due.paidAt).toLocaleString()}
                      </Text>
                      {due.razorpayPaymentId && (
                        <Text className="text-slate-500 text-xs mt-0.5">ID: {due.razorpayPaymentId}</Text>
                      )}
                    </View>
                  )}

                  {/* Pay button (unpaid only) */}
                  {due.status === 'unpaid' && (
                    <TouchableOpacity
                      onPress={() => handlePay(due)}
                      disabled={isBeingPaid}
                      className="bg-primary rounded-xl py-3 items-center flex-row justify-center"
                    >
                      {isBeingPaid
                        ? <ActivityIndicator color="white" size="small" />
                        : <>
                            <Ionicons name="card-outline" size={18} color="white" />
                            <Text className="text-white font-bold ml-2">Pay ₹{(due.amount / 100).toFixed(2)}</Text>
                          </>
                      }
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
