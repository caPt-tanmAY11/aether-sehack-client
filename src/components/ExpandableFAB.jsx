import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExpandableFAB({ actions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    
    Animated.spring(animation, {
      toValue: nextState ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 60,
    }).start();
  };

  const mainIconStyle = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  const menuStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    ],
    opacity: animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    }),
  };

  return (
    <View style={[styles.container, { bottom: insets.bottom + 90 }]}>
      {/* Menu overlay */}
      <Animated.View style={[styles.menuContainer, menuStyle]}>
        <View style={styles.blurMenu}>
          {actions.map((action, index) => (
            <TouchableOpacity 
                key={index} 
                style={styles.actionItem}
                onPress={() => {
                  toggleMenu();
                  if(action.onPress) action.onPress();
                }}
            >
              <Text style={styles.actionLabel}>{action.label}</Text>
              <View style={[styles.iconWrapper, { backgroundColor: action.color || '#6366f1' }]}>
                <Ionicons name={action.icon} size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Main button */}
      <TouchableOpacity 
        style={styles.fabMain} 
        activeOpacity={0.8} 
        onPress={toggleMenu}
      >
        <Animated.View style={mainIconStyle}>
          <Ionicons name="add" size={32} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    transformOrigin: 'bottom right',
  },
  blurMenu: {
    padding: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 6,
  },
  actionLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#091426',
    marginRight: 10,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6b38d4', 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6b38d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
