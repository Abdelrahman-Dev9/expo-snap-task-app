import { ComponentRef, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
};

export function OtpInput({ value, onChange, length = 6, error }: OtpInputProps) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const digits = value.split("").slice(0, length);

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="flex-row justify-between gap-2"
      >
        {Array.from({ length }).map((_, index) => {
          const digit = digits[index] ?? "";
          const isActive = focused && index === Math.min(digits.length, length - 1);
          const borderClass = error
            ? "border-accent-500"
            : isActive
              ? "border-brand-600"
              : digit
                ? "border-brand-300"
                : "border-ink-200";

          return (
            <View
              key={index}
              className={`h-16 flex-1 items-center justify-center rounded-2xl border-2 bg-surface ${borderClass}`}
            >
              <Text className="text-2xl font-bold text-ink-900">{digit}</Text>
              {isActive && !digit ? (
                <View className="absolute h-7 w-0.5 rounded-full bg-brand-600" />
              ) : null}
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        className="absolute h-0 w-0 opacity-0"
        caretHidden
      />

      {error ? (
        <Text className="mt-2 text-center text-sm text-accent-500">{error}</Text>
      ) : null}
    </View>
  );
}
