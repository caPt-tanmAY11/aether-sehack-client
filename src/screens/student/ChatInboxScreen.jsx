import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { chatApi } from '../../api/chat.api';
import { advisingApi } from '../../api/advising.api';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/ThemeContext';

export default function ChatInboxScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const { theme: T } = useTheme();
  
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('inbox'); // 'inbox' | 'advising'
  const [advisingRequests, setAdvisingRequests] = useState([]);

  // Form states
  const [faculty, setFaculty] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'inbox') {
        const data = await chatApi.getInbox().catch(() => []);
        setInbox(data || []);
      } else {
        const [facultyRes, requestsRes] = await Promise.all([
          apiClient.get('/auth/users', { params: { role: 'faculty,hod,dean' } }).catch(() => ({ data: { data: [] } })),
          advisingApi.getMyRequests().catch(() => [])
        ]);
        const availableFaculty = facultyRes.data?.data || [];
        setFaculty(availableFaculty);
        setAdvisingRequests(requestsRes || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!selectedFaculty || !message.trim()) {
      Alert.alert('Incomplete', 'Please select a faculty and write a message.');
      return;
    }
    setSubmitting(true);
    try {
      await advisingApi.createRequest({ facultyId: selectedFaculty._id, message: message.trim() });
      Alert.alert('✅ Success', 'Your advising request has been submitted!');
      setShowForm(false);
      setMessage('');
      setSelectedFaculty(null);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  const myId = user?._id || user?.userId;

  const openChat = async (item) => {
    const facultyId = item.other?._id;
    const facultyName = item.other?.name;
    navigation.navigate('Chat', { facultyId, facultyName });
  };

  const tryOpenAdvisingChat = async (req) => {
    const facultyId = req.facultyId?._id;
    const facultyName = req.facultyId?.name;
    if (req.status === 'pending') {
      Alert.alert(
        'Request Pending',
        'Your advising request is still pending. You can chat once the faculty acknowledges it.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate('Chat', { facultyId, facultyName });
  };

  const STATUS_COLOR = { pending: T.warning, acknowledged: T.accent, done: T.success, rejected: T.error };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border }} className="px-4 pt-12 pb-4">
        <Text style={{ color: T.text }} className="text-xl font-bold">Messages</Text>
      </View>

      {/* Tab Bar */}
      <View style={{ backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border }} className="flex-row px-4 py-2">
        <TouchableOpacity
          onPress={() => setTab('inbox')}
          style={{ backgroundColor: tab === 'inbox' ? T.accent : T.bg }}
          className="flex-1 py-2 rounded-xl mr-2 items-center"
        >
          <Text style={{ color: tab === 'inbox' ? '#fff' : T.muted }} className="font-bold text-sm">
            📨 Faculty Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('advising')}
          style={{ backgroundColor: tab === 'advising' ? T.accent : T.bg }}
          className="flex-1 py-2 rounded-xl items-center"
        >
          <Text style={{ color: tab === 'advising' ? '#fff' : T.muted }} className="font-bold text-sm">
            🎓 Advising
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {tab === 'inbox' && (
            <>
              <Text style={{ color: T.muted }} className="text-xs mb-4">
                Faculty can initiate chats with you. You can reply once they've messaged you.
              </Text>
              {inbox.length === 0 ? (
                <View className="items-center py-16">
                  <Ionicons name="chatbubbles-outline" size={56} color={T.muted} />
                  <Text style={{ color: T.muted }} className="text-lg mt-4">No messages yet</Text>
                  <Text style={{ color: T.muted }} className="text-xs text-center mt-2 px-8">
                    When a faculty member messages you, it will appear here.
                  </Text>
                </View>
              ) : (
                inbox.map((item, i) => {
                  const isLastMine = item.lastSenderId?.toString() === myId?.toString();
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => openChat(item)}
                      style={{ backgroundColor: T.card, borderColor: T.border }}
                      className="p-4 rounded-2xl border mb-3 flex-row items-center"
                    >
                      <View style={{ backgroundColor: `${T.success}20` }} className="w-12 h-12 rounded-full items-center justify-center mr-3">
                        <Text style={{ color: T.success }} className="text-lg font-bold">
                          {item.other?.name?.[0]?.toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text style={{ color: T.text }} className="font-bold">{item.other?.name}</Text>
                          <Text style={{ color: T.muted }} className="text-xs">
                            {new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <Text style={{ color: T.muted }} className="text-xs capitalize mb-0.5">{item.other?.role}</Text>
                        <Text style={{ color: T.textSub }} className="text-sm" numberOfLines={1}>
                          {isLastMine ? '✓ You: ' : ''}{item.lastMessage}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={T.muted} />
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          )}

          {tab === 'advising' && (
            <>
              {/* Toggle form button */}
              <TouchableOpacity
                onPress={() => setShowForm(!showForm)}
                style={{ backgroundColor: T.accent }}
                className="flex-row items-center justify-center p-3.5 rounded-2xl mb-4"
                activeOpacity={0.85}
              >
                <Ionicons name={showForm ? 'chevron-up-outline' : 'add-circle-outline'} size={20} color="#fff" />
                <Text className="text-white font-bold ml-2">{showForm ? 'Hide Form' : 'New Advising Request'}</Text>
              </TouchableOpacity>

              {/* Form Content */}
              {showForm && (
                <View style={{ backgroundColor: T.card, borderColor: T.border }} className="border p-4 rounded-2xl mb-6">
                  <Text style={{ color: T.text }} className="text-lg font-bold mb-1">Book a Session</Text>
                  <Text style={{ color: T.muted }} className="text-xs mb-4">Select a faculty member and describe what you'd like to discuss.</Text>

                  <Text style={{ color: T.muted }} className="text-[10px] font-bold uppercase tracking-widest mb-2">Choose Faculty</Text>
                  
                  {/* Custom Dropdown Picker */}
                  <TouchableOpacity
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                    style={{ backgroundColor: T.bg, borderColor: T.border }}
                    className="border p-3 rounded-xl flex-row justify-between items-center mb-4"
                  >
                    <Text style={{ color: selectedFaculty ? T.text : T.muted }} className="font-bold text-sm">
                      {selectedFaculty ? selectedFaculty.name : 'Select a faculty...'}
                    </Text>
                    <Ionicons name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color={T.muted} />
                  </TouchableOpacity>

                  {/* Dropdown Options */}
                  {dropdownOpen && (
                    <View style={{ backgroundColor: T.bg, borderColor: T.border }} className="border rounded-xl overflow-hidden mb-4 max-h-[200px]">
                      <ScrollView nestedScrollEnabled>
                        {faculty.length === 0 ? (
                          <Text style={{ color: T.muted }} className="p-3 text-sm">No faculty available.</Text>
                        ) : (
                          faculty.map((f, i) => (
                            <TouchableOpacity
                              key={f._id || i}
                              onPress={() => { setSelectedFaculty(f); setDropdownOpen(false); }}
                              style={{ 
                                borderBottomWidth: i < faculty.length - 1 ? 1 : 0, 
                                borderBottomColor: T.border,
                                backgroundColor: selectedFaculty?._id === f._id ? `${T.accent}15` : 'transparent'
                              }}
                              className="flex-row items-center p-3"
                            >
                              <View style={{ backgroundColor: `${T.accent}20` }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                                <Text style={{ color: T.accent }} className="font-bold text-sm">
                                  {f.name?.[0]?.toUpperCase()}
                                </Text>
                              </View>
                              <View className="flex-1">
                                <Text style={{ color: selectedFaculty?._id === f._id ? T.accent : T.text }} className="font-bold text-sm">
                                  {f.name}
                                </Text>
                                <Text style={{ color: T.muted }} className="text-xs">{f.departmentId?.name || 'Faculty'}</Text>
                              </View>
                            </TouchableOpacity>
                          ))
                        )}
                      </ScrollView>
                    </View>
                  )}

                  <Text style={{ color: T.muted }} className="text-[10px] font-bold uppercase tracking-widest mb-2">Your Message</Text>
                  <TextInput
                    style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
                    className="border rounded-xl p-3 text-sm min-h-[100px] mb-4"
                    placeholder="What would you like to discuss? (e.g. project guidance, academic issues...)"
                    placeholderTextColor={T.muted}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting}
                    style={{ backgroundColor: T.accent, opacity: submitting ? 0.7 : 1 }}
                    className="flex-row items-center justify-center p-3.5 rounded-xl"
                    activeOpacity={0.85}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                        <Text className="text-white font-bold ml-2">Send Request</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <Text style={{ color: T.muted }} className="text-xs flex-1 mr-2 mb-4">
                Your advising requests. Chat is unlocked once faculty acknowledges your request.
              </Text>
              {advisingRequests.length === 0 ? (
                <View className="items-center py-16">
                  <Ionicons name="school-outline" size={56} color={T.muted} />
                  <Text style={{ color: T.muted }} className="text-lg mt-4">No requests yet</Text>
                </View>
              ) : (
                advisingRequests.map((req, i) => {
                  const statusColor = STATUS_COLOR[req.status] || T.warning;
                  return (
                    <View key={i} style={{ backgroundColor: T.card, borderColor: T.border }} className="p-4 rounded-2xl border mb-3">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text style={{ color: T.text }} className="font-bold">{req.facultyId?.name}</Text>
                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${statusColor}20` }}>
                          <Text style={{ color: statusColor }} className="text-xs font-bold uppercase">
                            {req.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: T.textSub }} className="text-sm mb-2">{req.message}</Text>
                      {req.facultyReply ? (
                        <View style={{ backgroundColor: `${T.accent}10`, borderColor: `${T.accent}30` }} className="p-3 rounded-xl border mb-3">
                          <Text style={{ color: T.accent }} className="text-xs font-bold mb-1">Faculty Reply</Text>
                          <Text style={{ color: T.textSub }} className="text-sm">{req.facultyReply}</Text>
                        </View>
                      ) : null}
                      <TouchableOpacity
                        onPress={() => tryOpenAdvisingChat(req)}
                        style={{ 
                          backgroundColor: req.status === 'pending' ? T.bg : `${T.accent}20`,
                          borderColor: req.status === 'pending' ? T.border : `${T.accent}50` 
                        }}
                        className="py-2.5 rounded-xl border flex-row items-center justify-center"
                      >
                        <Ionicons
                          name={req.status === 'pending' ? 'lock-closed-outline' : 'chatbubble-outline'}
                          size={15}
                          color={req.status === 'pending' ? T.muted : T.accent}
                        />
                        <Text style={{ color: req.status === 'pending' ? T.muted : T.accent }} className="ml-2 font-bold text-sm">
                          {req.status === 'pending' ? 'Awaiting approval' : 'Open Chat'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </>
          )}
          <View className="h-10" />
        </ScrollView>
      )}
    </View>
  );
}
