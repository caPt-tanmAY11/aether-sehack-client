import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/ThemeContext';

export default function FacultyCoordinationScreen() {
  const { theme: T } = useTheme();
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [allFaculties, setAllFaculties] = useState([]);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/chat/coordination');
      setRooms(res.data.data || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load coordination rooms');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    setModalVisible(true);
    try {
      const res = await apiClient.get('/auth/users', { params: { role: 'faculty' } });
      // exclude self
      const others = (res.data.data || []).filter(f => f._id !== user.userId);
      setAllFaculties(others);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFaculty = (id) => {
    if (selectedFaculties.includes(id)) {
      setSelectedFaculties(selectedFaculties.filter(fid => fid !== id));
    } else {
      setSelectedFaculties([...selectedFaculties, id]);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return Alert.alert('Validation', 'Room name is required');
    if (selectedFaculties.length === 0) return Alert.alert('Validation', 'Select at least one faculty');
    
    setCreating(true);
    try {
      await apiClient.post('/chat/coordination', {
        name: newRoomName.trim(),
        members: selectedFaculties
      });
      setModalVisible(false);
      setNewRoomName('');
      setSelectedFaculties([]);
      fetchRooms();
    } catch (err) {
      Alert.alert('Error', 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1 }} className="px-4 pt-12 pb-4 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={T.text} />
          </TouchableOpacity>
          <Text style={{ color: T.text }} className="text-xl font-bold">Coordination Hub</Text>
        </View>
        <TouchableOpacity onPress={openCreateModal} style={{ backgroundColor: `${T.accent}20` }} className="p-2 rounded-full">
          <Ionicons name="add" size={24} color={T.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4 flex-1">
        {loading ? (
          <ActivityIndicator color={T.accent} size="large" className="mt-10" />
        ) : rooms.length === 0 ? (
          <View className="items-center mt-10">
            <Ionicons name="people-circle-outline" size={64} color={T.muted} />
            <Text style={{ color: T.muted }} className="text-lg mt-4">No coordination rooms found.</Text>
            <Text style={{ color: T.muted }} className="text-sm mt-2 text-center">Tap the + icon to create a room and invite other faculties.</Text>
          </View>
        ) : (
          rooms.map(room => (
            <TouchableOpacity 
              key={room._id} 
              onPress={() => navigation.navigate('CoordinationChat', { room })}
              style={{ backgroundColor: T.card, borderColor: T.border }}
              className="p-4 rounded-2xl border mb-4 flex-row items-center"
            >
              <View style={{ backgroundColor: `${T.accent}20` }} className="w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="chatbubbles" size={24} color={T.accent} />
              </View>
              <View className="flex-1">
                <Text style={{ color: T.text }} className="text-lg font-bold">{room.name}</Text>
                <Text style={{ color: T.muted }} className="text-sm">{room.members?.length || 0} Members</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={T.muted} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Create Room Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View style={{ backgroundColor: T.card }} className="rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ color: T.text }} className="text-xl font-bold">New Coordination Room</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={T.muted} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Room Name</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-4 rounded-xl border mb-6"
              placeholder="e.g. Web Dev Syllabus Planning"
              placeholderTextColor={T.muted}
              value={newRoomName}
              onChangeText={setNewRoomName}
            />

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Select Members</Text>
            <ScrollView style={{ backgroundColor: T.bg, borderColor: T.border }} className="border rounded-xl mb-6">
              {allFaculties.length === 0 ? (
                <Text style={{ color: T.muted }} className="p-4">Loading faculties...</Text>
              ) : (
                allFaculties.map((f, i) => {
                  const isSelected = selectedFaculties.includes(f._id);
                  return (
                    <TouchableOpacity 
                      key={f._id}
                      onPress={() => toggleFaculty(f._id)}
                      style={{ borderBottomColor: T.border, backgroundColor: isSelected ? `${T.accent}15` : T.bg }}
                      className={`flex-row items-center p-4 ${i < allFaculties.length - 1 ? 'border-b' : ''}`}
                    >
                      <View className="flex-1">
                        <Text style={{ color: isSelected ? T.accent : T.text }} className="font-bold">{f.name}</Text>
                        <Text style={{ color: T.muted }} className="text-xs mt-0.5">{f.departmentId?.name || 'Faculty'}</Text>
                      </View>
                      <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={24} color={isSelected ? T.accent : T.muted} />
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity 
              onPress={handleCreateRoom}
              disabled={creating}
              style={{ backgroundColor: T.accent }}
              className="p-4 rounded-xl items-center flex-row justify-center"
            >
              {creating ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-lg">Create Room</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
