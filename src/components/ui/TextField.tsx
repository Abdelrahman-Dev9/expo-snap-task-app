import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useState } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

type TextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  icon?: IconName;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  keyboardType?: TextInputProps["keyboardType"];
  autoComplete?: TextInputProps["autoComplete"];
  hint?: string;
};

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  icon,
  secureTextEntry,
  autoCapitalize = "none",
  keyboardType = "default",
  autoComplete,
  hint,
}: TextFieldProps<T>) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        const borderClass = error
          ? "border-accent-500"
          : focused
            ? "border-brand-600"
            : "border-ink-200";

        return (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-ink-700">
              {label}
            </Text>
            <View
              className={`h-14 flex-row items-center rounded-2xl border bg-surface px-4 ${borderClass}`}
            >
              {icon ? (
                <Ionicons
                  name={icon}
                  size={18}
                  color={focused ? "#4f46e5" : "#94a3b8"}
                  style={{ marginRight: 10 }}
                />
              ) : null}
              <TextInput
                className="flex-1 text-base text-ink-900"
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={onChange}
                onBlur={() => {
                  setFocused(false);
                  onBlur();
                }}
                onFocus={() => setFocused(true)}
                secureTextEntry={secureTextEntry && !revealed}
                autoCapitalize={autoCapitalize}
                keyboardType={keyboardType}
                autoComplete={autoComplete}
              />
              {secureTextEntry ? (
                <Pressable
                  onPress={() => setRevealed((v) => !v)}
                  hitSlop={10}
                  className="pl-2"
                >
                  <Ionicons
                    name={revealed ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#94a3b8"
                  />
                </Pressable>
              ) : null}
            </View>
            {error?.message ? (
              <Text className="mt-1.5 text-sm text-accent-500">
                {error.message}
              </Text>
            ) : hint ? (
              <Text className="mt-1.5 text-xs text-ink-500">{hint}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}
