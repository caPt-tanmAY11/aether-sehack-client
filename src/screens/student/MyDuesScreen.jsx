import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { paymentsApi } from '../../api/payments.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/ThemeContext';

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
  const { theme: T } = useTheme();

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
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={T.text} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: T.text, fontSize: 20, fontWeight: '900' }}>My Dues</Text>
            <Text style={{ color: T.muted, fontSize: 12 }}>Financial Settlement Gateway</Text>
          </View>
        </View>

        {/* Outstanding balance card */}
        <View style={{ backgroundColor: T.bg, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: T.muted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Outstanding</Text>
            <Text style={{ color: T.text, fontSize: 32, fontWeight: '900' }}>₹{outstanding.totalRupees}</Text>
            <Text style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>{outstanding.count} unpaid {outstanding.count === 1 ? 'due' : 'dues'}</Text>
          </View>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${T.error}22`, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="cash-outline" size={30} color={T.error} />
          </View>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8, backgroundColor: T.card, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: T.border }}>
        {['unpaid', 'history'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === tab ? T.accent : 'transparent' }}
          >
            <Text style={{ fontWeight: '800', textTransform: 'capitalize', color: activeTab === tab ? '#fff' : T.muted }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8 }}>
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 64 }}>
            <ActivityIndicator color={T.accent} size="large" />
          </View>
        ) : displayList.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 64 }}>
            <Ionicons name="checkmark-circle-outline" size={56} color={T.success} />
            <Text style={{ color: T.text, fontWeight: '900', fontSize: 18, marginTop: 16 }}>
              {activeTab === 'unpaid' ? 'No Pending Dues!' : 'No History Yet'}
            </Text>
            <Text style={{ color: T.muted, textAlign: 'center', marginTop: 8 }}>
              {activeTab === 'unpaid' ? "You're all cleared." : 'Payments will appear here once made.'}
            </Text>
          </View>
        ) : (
          displayList.map((due) => {
            const type = TYPE_CONFIG[due.type] || TYPE_CONFIG.other;
            const statusStyle = STATUS_STYLE[due.status] || STATUS_STYLE.unpaid;
            const isBeingPaid = paying === due._id;

            return (
              <View key={due._id} style={{ backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.border, marginBottom: 16, overflow: 'hidden' }}>
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    {/* Type icon */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: `${type.color}22` }}>
                        <Ionicons name={type.icon} size={20} color={type.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: T.muted, fontSize: 11, fontWeight: '800' }}>{type.label}</Text>
                        <Text style={{ color: T.text, fontWeight: '600', fontSize: 14 }} numberOfLines={2}>{due.description}</Text>
                      </View>
                    </View>
                    {/* Amount */}
                    <Text style={{ color: T.text, fontWeight: '900', fontSize: 18 }}>₹{(due.amount / 100).toFixed(2)}</Text>
                  </View>

                  {/* Meta */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1, backgroundColor: due.status === 'paid' ? `${T.success}18` : due.status === 'waived' ? `${T.muted}18` : `${T.error}18`, borderColor: due.status === 'paid' ? T.success : due.status === 'waived' ? T.muted : T.error }}>
                      <Ionicons name={statusStyle.icon} size={12} color={due.status === 'paid' ? T.success : due.status === 'waived' ? T.muted : T.error} />
                      <Text style={{ fontSize: 11, fontWeight: '800', marginLeft: 4, textTransform: 'capitalize', color: due.status === 'paid' ? T.success : due.status === 'waived' ? T.muted : T.error }}>{due.status}</Text>
                    </View>
                    <Text style={{ color: T.muted, fontSize: 12 }}>Due: {new Date(due.dueDate).toLocaleDateString()}</Text>
                    {due.issuedBy && <Text style={{ color: T.muted, fontSize: 12 }}>By: {due.issuedBy.name}</Text>}
                  </View>

                  {/* Paid info */}
                  {due.status === 'paid' && due.paidAt && (
                    <View style={{ backgroundColor: `${T.success}10`, borderWidth: 1, borderColor: `${T.success}50`, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 }}>
                      <Text style={{ color: T.success, fontSize: 12, fontWeight: '800' }}>
                        ✅ Paid on {new Date(due.paidAt).toLocaleString()}
                      </Text>
                      {due.razorpayPaymentId && (
                        <Text style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>ID: {due.razorpayPaymentId}</Text>
                      )}
                    </View>
                  )}

                  {/* Pay button */}
                  {due.status === 'unpaid' && (
                    <TouchableOpacity
                      onPress={() => handlePay(due)}
                      disabled={isBeingPaid}
                      style={{ backgroundColor: T.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                    >
                      {isBeingPaid
                        ? <ActivityIndicator color="white" size="small" />
                        : <>
                            <Ionicons name="card-outline" size={18} color="white" />
                            <Text style={{ color: 'white', fontWeight: '900', marginLeft: 8 }}>Pay ₹{(due.amount / 100).toFixed(2)}</Text>
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
