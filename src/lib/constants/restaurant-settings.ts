export type RestaurantSettingType = "boolean" | "number" | "text" | "json";

export type RestaurantSettingDefinition = {
  key: string;
  label: string;
  type: RestaurantSettingType;
  defaultValue?: string;
};

export const DEFAULT_DELIVERY_FEE_STRUCTURE_JSON = JSON.stringify({
  status: "true",
  max_delivery_km: 1,
  free_delivery_above: 0,
  tiers: [{ from_km: 0, to_km: 1, fee: 10 }],
});

export const RESTAURANT_SETTING_DEFINITIONS: RestaurantSettingDefinition[] = [
  { key: "auto_table_generation", label: "Auto table generation", type: "boolean", defaultValue: "true" },
  { key: "cash_on_delivery", label: "Cash on delivery", type: "boolean", defaultValue: "true" },
  { key: "catering", label: "Catering", type: "boolean", defaultValue: "true" },
  { key: "currency", label: "Currency", type: "text", defaultValue: "INR" },
  { key: "delivery_fee_structure", label: "Delivery fee structure", type: "json", defaultValue: DEFAULT_DELIVERY_FEE_STRUCTURE_JSON },
  { key: "delivery_sound", label: "Delivery sound", type: "boolean", defaultValue: "false" },
  { key: "delivery_sound_volume", label: "Delivery sound volume", type: "number", defaultValue: "75" },
  { key: "dinein_sound", label: "Dine-in sound", type: "boolean", defaultValue: "false" },
  { key: "dinein_sound_volume", label: "Dine-in sound volume", type: "number", defaultValue: "79" },
  { key: "foodtruck", label: "Foodtruck", type: "boolean", defaultValue: "false" },
  { key: "highchairs", label: "Highchairs", type: "boolean", defaultValue: "false" },
  { key: "horizontal_scrollbar", label: "Horizontal scrollbar", type: "boolean", defaultValue: "false" },
  { key: "is_delivery", label: "Delivery enabled", type: "boolean", defaultValue: "true" },
  { key: "is_waiter", label: "Waiter mode", type: "boolean", defaultValue: "false" },
  { key: "kot_enabled", label: "KOT enabled", type: "boolean", defaultValue: "true" },
  { key: "prep_time", label: "Prep time (minutes)", type: "number", defaultValue: "50" },
  { key: "qr", label: "QR ordering", type: "boolean", defaultValue: "true" },
  { key: "reservations", label: "Reservations", type: "boolean", defaultValue: "true" },
  { key: "session_code", label: "Session code", type: "boolean", defaultValue: "true" },
  { key: "shifts", label: "Shifts", type: "boolean", defaultValue: "false" },
  { key: "tables-management", label: "Tables management", type: "boolean", defaultValue: "true" },
  { key: "takeaway_sound", label: "Takeaway sound", type: "boolean", defaultValue: "false" },
  { key: "takeaway_sound_volume", label: "Takeaway sound volume", type: "number", defaultValue: "82" },
  { key: "tax_on_original_price", label: "Tax on original price", type: "boolean", defaultValue: "false" },
];

export const RESTAURANT_SETTING_KEYS = RESTAURANT_SETTING_DEFINITIONS.map((item) => item.key);
