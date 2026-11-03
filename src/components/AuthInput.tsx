import React, { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from './Icon';
import { COLORS } from '../constants/colors';

interface Props extends TextInputProps {
  icon: string;
  /** Champ mot de passe : ajoute l'icône œil pour afficher/masquer la saisie */
  secure?: boolean;
  error?: string | null;
}

const AuthInput = forwardRef<TextInput, Props>(
  ({ icon, secure = false, error, style, onFocus, onBlur, ...rest }, ref) => {
    const [hidden, setHidden] = useState(true);
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.wrapper}>
        <View
          style={[
            styles.field,
            focused && styles.fieldFocused,
            !!error && styles.fieldError,
          ]}
        >
          <Icon
            name={icon}
            size={20}
            color={focused ? COLORS.primary : COLORS.textSecondary}
          />
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor="#94A3B8"
            secureTextEntry={secure && hidden}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={e => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={e => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {secure && (
            <TouchableOpacity
              onPress={() => setHidden(h => !h)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={
                hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'
              }
            >
              <Icon
                name={hidden ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  },
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  fieldFocused: { borderColor: COLORS.primary },
  fieldError: { borderColor: COLORS.danger },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  error: { color: COLORS.danger, fontSize: 12, marginTop: 5, marginLeft: 4 },
});