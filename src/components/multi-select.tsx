import { useState } from "react";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "@/components/ui/combobox";

type Option = { value: string; label: string };
type Props = { id: string; options: Option[]; value: string[]; onChange: (value: string[]) => void; disabled?: boolean; creatable?: boolean; placeholder: string };

export function MultiSelect({ id, options, value, onChange, disabled, creatable, placeholder }: Props) {
  const anchor = useComboboxAnchor();
  const [query, setQuery] = useState("");
  const term = query.trim();
  const labels = new Map(options.map(o => [o.value, o.label]));
  const allValues = [...new Set([...options.map(o => o.value), ...value])];
  const isNew = Boolean(creatable && term && !allValues.some(v => v.toLowerCase() === term.toLowerCase()));
  const items = allValues.filter(v => (labels.get(v) ?? v).toLowerCase().includes(term.toLowerCase()));
  if (isNew) items.push(term);
  return <Combobox multiple items={items} filter={null} value={value} disabled={disabled}
    inputValue={query} onInputValueChange={setQuery}
    onValueChange={(next) => { onChange(next); setQuery(""); }}>
    <ComboboxChips ref={anchor} className={disabled ? "opacity-50" : ""}>
      <ComboboxValue>{value.map(v => <ComboboxChip key={v} aria-label={labels.get(v) ?? v}>{labels.get(v) ?? v}</ComboboxChip>)}</ComboboxValue>
      <ComboboxChipsInput id={id} placeholder={placeholder} disabled={disabled} />
    </ComboboxChips>
    <ComboboxContent anchor={anchor}>
      <ComboboxEmpty>ไม่พบรายการที่เลือกได้</ComboboxEmpty>
      <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>
        {isNew && item === term ? `+ เพิ่มผู้สอน "${term}"` : labels.get(item) ?? item}
      </ComboboxItem>}</ComboboxList>
    </ComboboxContent>
  </Combobox>;
}
