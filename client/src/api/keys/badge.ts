import { InjectionKey, Ref } from "vue";
import { Badge } from "../hook/badgeHook";

export const badgesKey = Symbol('badges') as InjectionKey<Ref<Badge[]>>