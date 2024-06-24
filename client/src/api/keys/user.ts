import { InjectionKey, Ref } from "vue";
import { User } from "../store/user";

export const userKey = Symbol('user') as InjectionKey<Ref<User>>