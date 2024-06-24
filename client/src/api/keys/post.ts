import { InjectionKey, Ref } from "vue";
import { Post } from "../hook/postHook";

export const postKey = Symbol('post') as InjectionKey<Ref<Post>>