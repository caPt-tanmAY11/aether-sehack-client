import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert,
  ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { timetableApi } from '../../api/timetable.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth.store';

// ─── Static reference data pulled from DB ────────────────────────────────────
const DEPARTMENTS = [
  { _id: '69e3a00f6a608145cf82a793', name: 'Computer Engineering', code: 'COMPS' },
  { _id: '69e3a00f6a608145cf82a79d', name: 'Computer Science & Engineering', code: 'CSE' },
  { _id: '69e3a00f6a608145cf82a7a5', name: 'Electronics & Telecommunication', code: 'EXTC' },
];

const ALL_SUBJECTS = [
  { _id: '69e3a0116a608145cf82a818', name: 'Data Structures', code: 'COMPS301', departmentId: '69e3a00f6a608145cf82a793' },
  { _id: '69e3a0116a608145cf82a82a', name: 'Object Oriented Programming', code: 'COMPS302', departmentId: '69e3a00f6a608145cf82a793' },
  { _id: '69e3a0146a608145cf82a97c', name: 'Machine Learning', code: 'CSE301', departmentId: '69e3a00f6a608145cf82a79d' },
  { _id: '69e3a0146a608145cf82a98b', name: 'Database Management Systems', code: 'CSE302', departmentId: '69e3a00f6a608145cf82a79d' },
  { _id: '69e3a0176a608145cf82aad0', name: 'Digital Electronics', code: 'EXTC301', departmentId: '69e3a00f6a608145cf82a7a5' },
  { _id: '69e3a0176a608145cf82aade', name: 'Analog Communication', code: 'EXTC302', departmentId: '69e3a00f6a608145cf82a7a5' },
];

const ALL_FACULTY = [
  { _id: '69e3a0116a608145cf82a812', name: 'Shri. Pramod Bide', departmentId: '69e3a00f6a608145cf82a793' },
  { _id: '69e3a0116a608145cf82a814', name: 'Dr. K.K. Devadkar', departmentId: '69e3a00f6a608145cf82a793' },
  { _id: '69e3a0116a608145cf82a816', name: 'Smt. Kiran Gawande', departmentId: '69e3a00f6a608145cf82a793' },
  { _id: '69e3a0146a608145cf82a976', name: 'Shri. D.D. Ambawade', departmentId: '69e3a00f6a608145cf82a79d' },
  { _id: '69e3a0146a608145cf82a978', name: 'Smt. Sheetal Chaudhari', departmentId: '69e3a00f6a608145cf82a79d' },
  { _id: '69e3a0146a608145cf82a97a', name: 'Smt. Aparna Halbe', departmentId: '69e3a00f6a608145cf82a79d' },
  { _id: '69e3a0176a608145cf82aaca', name: 'Smt. Manisha Bansode', departmentId: '69e3a00f6a608145cf82a7a5' },
  { _id: '69e3a0176a608145cf82aacc', name: 'Dr. N.A. Bhagat', departmentId: '69e3a00f6a608145cf82a7a5' },
  { _id: '69e3a0176a608145cf82aace', name: 'Dr. Amol Deshpande', departmentId: '69e3a00f6a608145cf82a7a5' },
];

const ALL_ROOMS = [
  { _id: '69e3cd8861bb50e896fbaa6b', name: 'CR-101', building: 'Main', floor: 1 },
  { _id: '69e3cd8861bb50e896fbaa6c', name: 'CR-102', building: 'Main', floor: 1 },
  { _id: '69e3cd8861bb50e896fbaa6d', name: 'CR-201', building: 'Main', floor: 2 },
  { _id: '69e3cd8861bb50e896fbaa6e', name: 'CR-202', building: 'Main', floor: 2 },
  { _id: '69e3cd8861bb50e896fbaa6f', name: 'CR-301', building: 'Main', floor: 3 },
  { _id: '69e3cd8861bb50e896fbaa70', name: 'CR-302', building: 'Main', floor: 3 },
  { _id: '69e3cd8861bb50e896fbaa71', name: 'CR-401', building: 'Main', floor: 4 },
  { _id: '69e3cd8861bb50e896fbaa72', name: 'CR-402', building: 'Main', floor: 4 },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const DIVISIONS = ['A', 'B', 'C', 'D'];
const SLOT_TYPES = ['lecture', 'lab'];

// Time slots in HH:MM
const TIME_OPTIONS = [
  '08:00','09:00','10:00','11:00','12:00','13:00',
  '14:00','15:00','16:00','17:00','18:00',
];

// ─── Generic dropdown picker ──────────────────────────────────────────────────
function Picker({ label, value, options, onSelect, keyExtractor, labelExtractor }) {
  const [open, setOpen] = useState(false);
  const displayLabel = value ? labelExtractor(options.find(o => keyExtractor(o) === value) || {}) : `Select ${label}`;

  return (
    <View className="mb-4">
      <Text className="text-muted text-xs font-bold mb-1 uppercase tracking-wider">{label}</Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="bg-surface flex-row items-center justify-between px-4 py-3 rounded-xl border border-border"
      >
        <Text className={value ? 'text-white text-sm' : 'text-muted text-sm'} numberOfLines={1}>
          {displayLabel}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#64748b" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setOpen(false)}
          className="flex-1 bg-black/60 justify-end"
        >
          <View className="bg-card rounded-t-3xl border-t border-border max-h-80">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
              <Text className="text-white font-bold text-base">{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={keyExtractor}
              renderItem={({ item }) => {
                const selected = keyExtractor(item) === value;
                return (
                  <TouchableOpacity
                    onPress={() => { onSelect(keyExtractor(item)); setOpen(false); }}
                    className={`px-5 py-4 border-b border-border/40 flex-row items-center justify-between ${selected ? 'bg-primary/10' : ''}`}
                  >
                    <Text className={selected ? 'text-primary font-bold' : 'text-white'}>
                      {labelExtractor(item)}
                    </Text>
                    {selected && <Ionicons name="checkmark-circle" size={18} color="#6366f1" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Single slot editor card ──────────────────────────────────────────────────
function SlotCard({ slot, index, onUpdate, onRemove, subjects, faculty }) {
  return (
    <View className="bg-surface rounded-2xl border border-border mb-4 overflow-hidden">
      <View className="flex-row items-center justify-between px-4 py-3 bg-card border-b border-border">
        <Text className="text-primary font-bold text-sm">Slot {index + 1}</Text>
        <TouchableOpacity onPress={onRemove}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View className="px-4 pt-3">
        <Picker
          label="Day"
          value={slot.day}
          options={DAYS.map(d => ({ id: d, label: d }))}
          onSelect={(v) => onUpdate({ day: v })}
          keyExtractor={(o) => o.id}
          labelExtractor={(o) => o.label || ''}
        />

        <View className="flex-row">
          <View className="flex-1 mr-2">
            <Picker
              label="Start Time"
              value={slot.startTime}
              options={TIME_OPTIONS.map(t => ({ id: t, label: t }))}
              onSelect={(v) => onUpdate({ startTime: v })}
              keyExtractor={(o) => o.id}
              labelExtractor={(o) => o.label || ''}
            />
          </View>
          <View className="flex-1 ml-2">
            <Picker
              label="End Time"
              value={slot.endTime}
              options={TIME_OPTIONS.map(t => ({ id: t, label: t }))}
              onSelect={(v) => onUpdate({ endTime: v })}
              keyExtractor={(o) => o.id}
              labelExtractor={(o) => o.label || ''}
            />
          </View>
        </View>

        <Picker
          label="Subject"
          value={slot.subjectId}
          options={subjects}
          onSelect={(v) => onUpdate({ subjectId: v })}
          keyExtractor={(o) => o._id}
          labelExtractor={(o) => o.name ? `${o.name} (${o.code})` : ''}
        />

        <Picker
          label="Faculty"
          value={slot.facultyId}
          options={faculty}
          onSelect={(v) => onUpdate({ facultyId: v })}
          keyExtractor={(o) => o._id}
          labelExtractor={(o) => o.name || ''}
        />

        <Picker
          label="Room"
          value={slot.roomId}
          options={ALL_ROOMS}
          onSelect={(v) => onUpdate({ roomId: v })}
          keyExtractor={(o) => o._id}
          labelExtractor={(o) => o.name ? `${o.name} — Floor ${o.floor}` : ''}
        />

        <Picker
          label="Type"
          value={slot.slotType}
          options={SLOT_TYPES.map(t => ({ id: t, label: t === 'lab' ? '🔬 Lab (2hr)' : '📖 Lecture (1hr)' }))}
          onSelect={(v) => onUpdate({ slotType: v })}
          keyExtractor={(o) => o.id}
          labelExtractor={(o) => o.label || ''}
        />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const BLANK_SLOT = () => ({
  day: '',
  startTime: '',
  endTime: '',
  subjectId: '',
  facultyId: '',
  roomId: '',
  slotType: 'lecture',
});

export default function TimetableUploadScreen() {
  const navigation = useNavigation();
  const userDeptId = useAuthStore(state => state.user?.departmentId);

  const [semester, setSemester] = useState('');
  const [division, setDivision] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [slots, setSlots] = useState([BLANK_SLOT()]);
  const [loading, setLoading] = useState(false);

  // Filter subjects & faculty by the logged-in user's department
  const deptSubjects = ALL_SUBJECTS.filter(s => s.departmentId === userDeptId);
  const deptFaculty = ALL_FACULTY.filter(f => f.departmentId === userDeptId);

  // If department not matched (safety), fall back to all
  const subjects = deptSubjects.length ? deptSubjects : ALL_SUBJECTS;
  const faculty = deptFaculty.length ? deptFaculty : ALL_FACULTY;

  const addSlot = () => setSlots(prev => [...prev, BLANK_SLOT()]);

  const updateSlot = (index, changes) => {
    setSlots(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...changes };
      return updated;
    });
  };

  const removeSlot = (index) => {
    if (slots.length === 1) { Alert.alert('', 'At least one slot is required.'); return; }
    setSlots(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!semester) return 'Please select a semester.';
    if (!division) return 'Please select a division.';
    if (!academicYear.match(/^\d{4}-\d{4}$/)) return 'Academic year must be YYYY-YYYY.';
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (!s.day) return `Slot ${i + 1}: select a day.`;
      if (!s.startTime) return `Slot ${i + 1}: select start time.`;
      if (!s.endTime) return `Slot ${i + 1}: select end time.`;
      if (s.startTime >= s.endTime) return `Slot ${i + 1}: start time must be before end time.`;
      if (!s.subjectId) return `Slot ${i + 1}: select a subject.`;
      if (!s.facultyId) return `Slot ${i + 1}: select a faculty.`;
      if (!s.roomId) return `Slot ${i + 1}: select a room.`;
    }
    return null;
  };

  const handleUpload = async () => {
    const err = validate();
    if (err) { Alert.alert('Incomplete', err); return; }
    try {
      setLoading(true);
      await timetableApi.upload({
        semester: Number(semester),
        division,
        academicYear,
        slots,
      });
      Alert.alert('✅ Submitted', 'Timetable sent to HOD for review!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || e.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027'];

  return (
    <View className="flex-1 bg-surface">
      {/* Fixed Header */}
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">Upload Timetable</Text>
          <Text className="text-muted text-xs">{slots.length} slot{slots.length !== 1 ? 's' : ''} configured</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" keyboardShouldPersistTaps="handled">
        {/* Section Meta */}
        <View className="bg-card p-4 rounded-2xl border border-border mb-4">
          <Text className="text-white font-bold mb-3">Timetable Details</Text>

          <Picker
            label="Semester"
            value={semester}
            options={SEMESTERS.map(s => ({ id: s, label: `Semester ${s}` }))}
            onSelect={setSemester}
            keyExtractor={(o) => o.id}
            labelExtractor={(o) => o.label || ''}
          />

          <Picker
            label="Division"
            value={division}
            options={DIVISIONS.map(d => ({ id: d, label: `Division ${d}` }))}
            onSelect={setDivision}
            keyExtractor={(o) => o.id}
            labelExtractor={(o) => o.label || ''}
          />

          <Picker
            label="Academic Year"
            value={academicYear}
            options={ACADEMIC_YEARS.map(y => ({ id: y, label: y }))}
            onSelect={setAcademicYear}
            keyExtractor={(o) => o.id}
            labelExtractor={(o) => o.label || ''}
          />
        </View>

        {/* Slot Cards */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white font-bold text-base">Slots</Text>
          <TouchableOpacity
            onPress={addSlot}
            className="flex-row items-center bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/40"
          >
            <Ionicons name="add" size={18} color="#6366f1" />
            <Text className="text-primary text-sm font-bold ml-1">Add Slot</Text>
          </TouchableOpacity>
        </View>

        {slots.map((slot, i) => (
          <SlotCard
            key={i}
            slot={slot}
            index={i}
            onUpdate={(changes) => updateSlot(i, changes)}
            onRemove={() => removeSlot(i)}
            subjects={subjects}
            faculty={faculty}
          />
        ))}

        {/* Submit */}
        <TouchableOpacity
          onPress={handleUpload}
          disabled={loading}
          className="bg-primary p-4 rounded-2xl flex-row justify-center items-center mb-10 mt-2"
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <>
                <Ionicons name="cloud-upload-outline" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">Submit to HOD</Text>
              </>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
