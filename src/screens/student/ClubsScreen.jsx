import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clubsApi } from '../../api/clubs.api';
import { useAuthStore } from '../../store/auth.store';

export default function ClubsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchClubs();
  }, [activeTab]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      if (activeTab === 'all') {
        const data = await clubsApi.listClubs();
        setClubs(data);
      } else {
        const data = await clubsApi.getMyClubs();
        setMyClubs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      setLoading(true);
      await clubsApi.joinClub(id);
      Alert.alert('Success', 'Joined the club successfully!');
      fetchClubs();
    } catch (err) {
      Alert.alert('Failed', err?.response?.data?.message || 'Failed to join club');
      setLoading(false);
    }
  };

  const handleLeave = async (id) => {
    try {
      setLoading(true);
      await clubsApi.leaveClub(id);
      Alert.alert('Success', 'Left the club.');
      fetchClubs();
    } catch (err) {
      Alert.alert('Failed', err?.response?.data?.message || 'Failed to leave club');
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-surface rounded-full">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Campus Clubs</Text>
      </View>

      <View className="flex-row mx-4 mt-4 mb-2 bg-card rounded-xl p-1 border border-border">
        <TouchableOpacity 
          onPress={() => setActiveTab('all')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'all' ? 'bg-primary' : 'bg-transparent'}`}
        >
          <Text className={activeTab === 'all' ? 'text-white font-bold' : 'text-muted font-bold'}>All Clubs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('my')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'my' ? 'bg-primary' : 'bg-transparent'}`}
        >
          <Text className={activeTab === 'my' ? 'text-white font-bold' : 'text-muted font-bold'}>My Clubs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4 flex-1">
        {loading ? (
          <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
        ) : activeTab === 'all' ? (
          clubs.length === 0 ? (
            <View className="items-center mt-10"><Text className="text-muted text-lg">No clubs exist yet.</Text></View>
          ) : (
            clubs.map(club => (
              <View key={club._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white text-lg font-bold">{club.name}</Text>
                  <View className="bg-primary/20 px-2 py-1 rounded-md border border-primary/30">
                    <Text className="text-primary text-xs font-bold uppercase">{club.type}</Text>
                  </View>
                </View>
                <Text className="text-slate-300 mb-4">{club.description}</Text>
                
                <View className="flex-row items-center justify-between border-t border-border pt-3 mt-1">
                  <Text className="text-muted text-sm">{club.members?.length || 0} Members</Text>
                  {!club.members?.some(m => m.studentId === user?._id) ? (
                    <TouchableOpacity onPress={() => handleJoin(club._id)} className="bg-success/20 border border-success/30 px-4 py-1.5 rounded-lg">
                      <Text className="text-success font-bold text-sm">Join Club</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => handleLeave(club._id)} className="bg-surface border border-border px-4 py-1.5 rounded-lg">
                      <Text className="text-muted font-bold text-sm">Leave</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )
        ) : (
          myClubs.length === 0 ? (
            <View className="items-center mt-10"><Text className="text-muted text-lg">You haven't joined any clubs.</Text></View>
          ) : (
            myClubs.map(club => (
              <View key={club._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
                <Text className="text-white text-lg font-bold mb-2">{club.name}</Text>
                <Text className="text-slate-300 mb-4">{club.description}</Text>
                <TouchableOpacity onPress={() => handleLeave(club._id)} className="self-end bg-error/10 border border-error/30 px-4 py-1.5 rounded-lg mt-2">
                  <Text className="text-error font-bold text-sm">Leave Club</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
