import React, {useEffect, useState} from 'react';
import {KeyboardAvoidingView, Platform, SafeAreaView, View} from 'react-native';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import Animated, {Easing} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {GetPremium} from '../../components/ActionSheetComponent/GetPremium';
import Paragraph from '../../components/Typography/Paragraph';
import {useTracked} from '../../provider';
import {DDS} from '../../services/DeviceDetection';
import {eSendEvent} from '../../services/EventManager';
import {eOnLoadNote} from '../../utils/Events';
import {editorRef} from '../../utils/Refs';
import EditorOverlay from './EditorOverlay';
let prevVal = 0;
let finalValue = 80;
let anim2 = new Animated.Value(0);
const op1 = new Animated.Value(1);
const op2 = new Animated.Value(0);
const op3 = new Animated.Value(0);

const onHandlerStateChange = (evt) => {
  if (evt.nativeEvent.state === State.END) {
    if (evt.nativeEvent.translationY >= finalValue) {
      eSendEvent(eOnLoadNote, {type: 'new'});
      opacityAnim(0, 1, 0);
      setTimeout(() => {
        animation(0);
        setTimeout(() => {
          opacityAnim(1, 0, 0);
        }, 150);
      }, 200);
    } else {
      animation(0);
      setTimeout(() => {
        opacityAnim(1, 0, 0);
      }, 150);
    }
  }
};

const onGestureEvent = (event) => {
  if (event.nativeEvent.translationY < 0) return;

  let v = event.nativeEvent.translationY;
  if (v >= 80 && prevVal !== 80) {
    prevVal = 80;
    animation(80);
    opacityAnim(0, 0, 1);

    return;
  }
  if (v >= 80) return;
  prevVal = v;
  anim2.setValue(v);
};

function animation(a) {
  Animated.timing(anim2, {
    toValue: a,
    duration: 150,
    easing: Easing.inOut(Easing.ease),
  }).start();
}

function opacityAnim(a, b, c) {
  Animated.timing(op1, {
    toValue: a,
    duration: 50,
    easing: Easing.inOut(Easing.ease),
  }).start();
  Animated.timing(op2, {
    toValue: b,
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  }).start();
  Animated.timing(op3, {
    toValue: c,
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  }).start();
}

const AnimatedKeyboardView = Animated.createAnimatedComponent(
  KeyboardAvoidingView,
);

let Editor;

export const EditorWrapper = ({dimensions}) => {
  const [state] = useTracked();
  const {colors, loading} = state;
  const [loaded, setLoaded] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loading) {
      if (!Editor) {
        Editor = require('./index').default;
      }
      setLoaded(true);
    }
  }, [loading]);

  return (
    <View
      ref={editorRef}
      style={{
        width: DDS.isLargeTablet() ? dimensions.width * 0.55 : dimensions.width,
        height: '100%',
        backgroundColor: colors.bg,
        borderLeftWidth: 1,
        borderLeftColor: DDS.isLargeTablet() ? colors.nav : 'transparent',
      }}>
      <SafeAreaView
        style={{
          width: '100%',
          height: '100%',
        }}>
        <GetPremium context="editor" offset={50 + insets.top} />
        <View
          style={{
            position: 'absolute',
            zIndex: 20,
            height: insets.top,
            top: 0,
            width: dimensions.width,
            backgroundColor: colors.bg,
          }}
        />
        <PanGestureHandler
          minPointers={2}
          onHandlerStateChange={onHandlerStateChange}
          onGestureEvent={onGestureEvent}>
          <AnimatedKeyboardView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={{
              transform: [
                {
                  translateY: anim2,
                },
              ],
              height: '100%',
              width: '100%',
            }}>
            <View
              style={{
                height: 80,
                position: 'absolute',
                backgroundColor: colors.accent,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                transform: [
                  {
                    translateY: Platform.OS === 'ios' ? -80 : -80 + insets.top,
                  },
                ],
              }}>
              <Animated.Text
                style={{
                  position: 'absolute',
                  opacity: op1,
                  bottom: 10,
                }}>
                <Paragraph color="white">
                  Keep swiping down to start a new note.
                </Paragraph>
              </Animated.Text>

              <Animated.Text
                style={{
                  position: 'absolute',
                  opacity: op3,
                }}>
                <Paragraph color="white">Release to load new note</Paragraph>
              </Animated.Text>

              <Animated.Text
                style={{
                  position: 'absolute',
                  opacity: op2,
                }}>
                <Paragraph color="white">Loading a new note</Paragraph>
              </Animated.Text>
            </View>

            {!loaded || loading ? null : <Editor />}
            <EditorOverlay />
          </AnimatedKeyboardView>
        </PanGestureHandler>
      </SafeAreaView>
    </View>
  );
};
