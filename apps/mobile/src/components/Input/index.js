import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTracked } from '../../provider/index';
import {
  ERRORS_LIST,
  validateEmail,
  validatePass,
  validateUsername
} from '../../services/Validation';
import { getElevation } from '../../utils';
import { SIZE } from '../../utils/SizeUtils';
import { ActionIcon } from '../ActionIcon';
import Paragraph from '../Typography/Paragraph';

const Input = ({
  fwdRef,
  validationType,
  loading,
  autoCapitalize,
  onChangeText,
  onSubmit,
  blurOnSubmit,
  placeholder,
  onErrorCheck,
  errorMessage,
  secureTextEntry,
  customColor,
  customValidator,
  marginBottom = 10,
  button,
  testID,
  defaultValue,
  clearTextOnFocus
}) => {
  const [state] = useTracked();
  const colors = state.colors;
  const [error, setError] = useState(false);
  const [value, setValue] = useState(null);
  const [focus, setFocus] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorList, setErrorList] = useState({
    SHORT_PASS: true,
    NO_ABC: true,
    NO_CAPS_ABC: true,
    NO_NUM: true,
    SPECIAL: true,
  });
  const color = error
    ? colors.red
    : focus
    ? customColor || colors.accent
    : colors.nav;

  const validate = (value) => {
    if (!validationType) return;
    if (!value || value?.length === 0) {
      setError(false);
      onErrorCheck(false);
      setErrorList({
        SHORT_PASS: true,
        NO_ABC: true,
        NO_CAPS_ABC: true,
        NO_NUM: true,
        SPECIAL: true,
      });
      return;
    }
    let isError = false;
    switch (validationType) {
      case 'password':
        isError = validatePass(value);
        break;
      case 'email':
        isError = validateEmail(value);
        break;
      case 'username':
        isError = validateUsername(value);
        break;
      case 'confirmPassword':
        isError = value === customValidator();
        break;
    }
    console.log('isError', isError, error);

    if (validationType === 'password') {
      let hasError = false;

      Object.keys(isError).forEach((e) => {
        if (isError[e] === true) {
          hasError = true;
        }
      });
      setError(hasError);
      onErrorCheck(hasError);
      setErrorList(isError);
    } else {
      setError(!isError);
      onErrorCheck(!isError);
    }
  };

  const onChange = (value) => {
    onChangeText(value);
    setValue(value);
    validate(value);
  };

  const onBlur = () => {
    setFocus(false);
  };

  const onFocus = () => {
    setFocus(true);
  };

  const style = {
    borderBottomWidth: 1,
    borderColor: color,
    paddingHorizontal: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 50,
    marginBottom: marginBottom,
  };

  const textStyle = {
    paddingHorizontal: 0,
    fontSize: SIZE.md,
    color: colors.pri,
    paddingVertical: 0,
    paddingBottom: 2.5,
    flexGrow: 1,
    height: 35,
  };



  return (
    <>
      <View style={style}>
        <TextInput
          ref={fwdRef}
          testID={testID}
          editable={!loading}
          defaultValue={defaultValue}
          autoCapitalize={autoCapitalize}
          onChangeText={onChange}
          onBlur={onBlur}
          onEndEditing={() => {
            if (clearTextOnFocus) {
              setValue(null)
            }
          }}
          onFocus={onFocus}
          value={value}
          onSubmitEditing={onSubmit}
          blurOnSubmit={blurOnSubmit}
          style={textStyle}
          secureTextEntry={secureTextEntry && secureEntry}
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            height: 35,
            alignItems: 'center',
          }}>
          {secureTextEntry && (
            <ActionIcon
              name="eye"
              size={20}
              top={10}
              bottom={10}
              onPress={() => {
                setSecureEntry(!secureEntry);
              }}
              style={{
                width: 25,
                marginLeft: 5,
              }}
              color={secureEntry ? colors.icon : colors.accent}
            />
          )}

          {button && (
            <ActionIcon
              name={button.icon}
              size={20}
              top={10}
              bottom={10}
              onPress={button.onPress}
              style={{
                width: 25,
                marginLeft: 5,
              }}
              color={button.color}
            />
          )}

          {error && (
            <ActionIcon
              name="alert-circle-outline"
              top={10}
              bottom={10}
              onPress={() => {
                setShowError(!showError);
              }}
              size={20}
              style={{
                width: 25,
                marginLeft: 5,
              }}
              color={colors.errorText}
            />
          )}
        </View>

        {error && showError && errorMessage ? (
          <View
            style={{
              position: 'absolute',
              backgroundColor: colors.nav,
              paddingVertical: 3,
              paddingHorizontal: 5,
              borderRadius: 2.5,
              ...getElevation(2),
              top: 0,
            }}>
            <Paragraph
              size={SIZE.xs}
              style={{
                textAlign: 'right',
                textAlignVertical: 'bottom',
              }}>
              <Icon
                name="alert-circle-outline"
                size={SIZE.xs}
                color={colors.errorText}
              />{' '}
              {errorMessage}
            </Paragraph>
          </View>
        ) : null}
      </View>

      {validationType === 'password' && focus && (
        <View
          style={{
            paddingTop: 5,
          }}>
          {Object.keys(errorList).filter((k) => errorList[k] === true)
            .length !== 0 ? (
            Object.keys(ERRORS_LIST).map((error) => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name={errorList[error] ? 'close' : 'check'}
                  color={errorList[error] ? 'red' : 'green'}
                />

                <Paragraph style={{marginLeft: 5}} size={SIZE.xs}>
                  {ERRORS_LIST[error]}
                </Paragraph>
              </View>
            ))
          ) : (
            <Paragraph color={colors.green} size={SIZE.xs}>
              Password is strong.
            </Paragraph>
          )}
        </View>
      )}
    </>
  );
};

export default Input;
