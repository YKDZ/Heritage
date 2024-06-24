import { InjectionKey, Ref } from "vue";
import { Tag } from "../hook/tagHook";

export const tagsKey = Symbol('tags') as InjectionKey<Ref<Tag[]>>