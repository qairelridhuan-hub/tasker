import React, { useEffect, useRef } from 'react';
import {
  Modal, View, StyleSheet, TouchableWithoutFeedback,
  Animated, Dimensions, KeyboardAvoidingView, Platform,
  TouchableOpacity,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '../constants/theme';

const { height: SCREEN_H } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: number;
  hideClose?: boolean;
}

export default function BottomSheet({ visible, onClose, children, snapHeight = SCREEN_H * 0.85, hideClose = false }: Props) {
  const translateY = useRef(new Animated.Value(snapHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: snapHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { height: snapHeight, transform: [{ translateY }] }]}>
          {!hideClose && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={20} color={Colors.black} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.ultraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
