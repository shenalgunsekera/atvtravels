import {
  Award, BadgePercent, Building2, Calendar, Camera, Car, CircleCheck, Clock, Compass, DollarSign,
  Gift, Globe, Headphones, Heart, Luggage, Map, MapPin, Mountain, Plane, Shield, Ship, Smile,
  Sparkles, Star, Sun, ThumbsUp, TreePalm, Users, Utensils, Wallet, type LucideIcon,
} from "lucide-react";

// Icons the admin can choose for feature cards ("Why choose us", "Core values").
export const ICONS: Record<string, LucideIcon> = {
  Shield, DollarSign, Map, Users, Headphones, Star, Heart, Globe, Award, Plane,
  Building2, Camera, Compass, Sun, TreePalm, Ship, Car, Clock, ThumbsUp, Sparkles,
  Wallet, CircleCheck, Smile, Mountain, Utensils, Gift, Luggage, MapPin, Calendar, BadgePercent,
};

export const ICON_NAMES = Object.keys(ICONS);

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Star;
}
