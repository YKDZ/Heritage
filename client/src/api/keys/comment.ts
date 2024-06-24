import { InjectionKey, Ref } from "vue";
import { Comment } from "../hook/commentHook";

export const commentKey = Symbol('comment') as InjectionKey<Ref<Comment>>