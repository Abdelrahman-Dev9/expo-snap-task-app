import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import {
  formatTaskDueAt,
  REMIND_BEFORE_OPTIONS,
  type RemindBeforeMinutes,
} from "./types";

type Props = {
  dueAt: Date | null;
  remindBeforeMinutes: RemindBeforeMinutes;
  onChangeDueAt: (value: Date | null) => void;
  onChangeRemindBefore: (value: RemindBeforeMinutes) => void;
};

export function DueScheduleFields({
  dueAt,
  remindBeforeMinutes,
  onChangeDueAt,
  onChangeRemindBefore,
}: Props) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showRemindOptions, setShowRemindOptions] = useState(false);
  const pickerValue = dueAt ?? new Date(Date.now() + 60 * 60 * 1000);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShowDate(false);
    if (event.type === "dismissed") return;
    if (!date) return;

    const next = new Date(pickerValue);
    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    if (!dueAt) {
      next.setHours(pickerValue.getHours(), pickerValue.getMinutes(), 0, 0);
    }
    onChangeDueAt(next);
    if (Platform.OS === "android") setShowTime(true);
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShowTime(false);
    if (event.type === "dismissed") return;
    if (!date) return;

    const next = new Date(pickerValue);
    next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChangeDueAt(next);
  };

  const remindLabel =
    REMIND_BEFORE_OPTIONS.find((o) => o.value === remindBeforeMinutes)
      ?.label ?? "No advance reminder";

  return (
    <View className="mb-6">
      <Text className="mb-2 text-sm font-semibold text-ink-700">
        Due date & reminder (optional)
      </Text>

      <Pressable
        onPress={() => {
          if (Platform.OS === "android") setShowDate(true);
          else setShowDate((v) => !v);
        }}
        className="mb-2 flex-row items-center justify-between rounded-2xl border border-ink-200 bg-surface px-4 py-4"
      >
        <View className="mr-3 flex-1 flex-row items-center gap-3">
          <Ionicons name="alarm-outline" size={20} color="#4f46e5" />
          <View className="flex-1">
            {dueAt ? (
              <>
                <Text className="text-sm font-semibold text-ink-900">
                  {formatTaskDueAt(dueAt.toISOString())}
                </Text>
                <Text className="mt-0.5 text-xs text-ink-500">
                  Tap to change date & time
                </Text>
              </>
            ) : (
              <Text className="text-sm text-ink-500">
                Set when you should start this task
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </Pressable>

      {Platform.OS === "ios" && showDate ? (
        <View className="mb-2 overflow-hidden rounded-2xl border border-ink-200 bg-surface">
          <DateTimePicker
            value={pickerValue}
            mode="datetime"
            display="spinner"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
          <Pressable
            onPress={() => setShowDate(false)}
            className="items-center border-t border-ink-100 py-3"
          >
            <Text className="font-semibold text-brand-600">Done</Text>
          </Pressable>
        </View>
      ) : null}

      {Platform.OS === "android" && showDate ? (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      ) : null}

      {Platform.OS === "android" && showTime ? (
        <DateTimePicker
          value={pickerValue}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      ) : null}

      {dueAt ? (
        <>
          <Pressable
            onPress={() => setShowRemindOptions((v) => !v)}
            className="mb-2 flex-row items-center justify-between rounded-2xl border border-ink-200 bg-surface px-4 py-4"
          >
            <View className="mr-3 flex-1 flex-row items-center gap-3">
              <Ionicons name="notifications-outline" size={20} color="#4f46e5" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-ink-900">
                  {remindLabel}
                </Text>
                <Text className="mt-0.5 text-xs text-ink-500">
                  Plus a notification at the due time
                </Text>
              </View>
            </View>
            <Ionicons
              name={showRemindOptions ? "chevron-up" : "chevron-forward"}
              size={18}
              color="#94a3b8"
            />
          </Pressable>

          {showRemindOptions ? (
            <View className="mb-2 overflow-hidden rounded-2xl border border-ink-200 bg-surface">
              {REMIND_BEFORE_OPTIONS.map((option, index) => {
                const selected = option.value === remindBeforeMinutes;
                return (
                  <Pressable
                    key={String(option.value)}
                    onPress={() => {
                      onChangeRemindBefore(option.value);
                      setShowRemindOptions(false);
                    }}
                    className={`flex-row items-center justify-between px-4 py-3 ${
                      index > 0 ? "border-t border-ink-100" : ""
                    } ${selected ? "bg-brand-50" : ""}`}
                  >
                    <Text
                      className={`text-sm ${
                        selected
                          ? "font-semibold text-brand-700"
                          : "text-ink-900"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark" size={18} color="#4f46e5" />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <Pressable
            onPress={() => {
              onChangeDueAt(null);
              onChangeRemindBefore(null);
              setShowRemindOptions(false);
            }}
          >
            <Text className="text-sm font-semibold text-accent-500">
              Remove due date
            </Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}
