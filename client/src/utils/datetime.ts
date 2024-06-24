import { format, formatDistanceToNow } from "date-fns"
import { zhCN } from 'date-fns/locale'

export const formatDate = (date: Date | undefined, formatString?: string) => {
    if (!date) {
        return ""
    }
    return format(date, formatString || "yyyy 年 MM 月 dd 日 HH:mm")
}

export const formatDateWithoutDetails = (date: Date | undefined) => {
    if (!date) {
        return ""
    }
    return format(date, "yyyy 年 MM 月 dd 日")
}

export const formatDateDistanceToNow = (date: Date | undefined, formatString?: string) => {
    if (!date) {
        return ""
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
}

export const formateDateWithDay = (date?: Date) => {
    if (!date) {
        return ""
    }
    const day = convertToCN(date.getDay())
    return format(date, `yyyy 年 MM 月 dd 日 星期${day}`)
}

export const convertToCN = (num: number): string => {
    let words = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
    let adds = ["", '十', '百', '千', '万', '亿', '十', '百', '千'];
    if (words[num]) {
        return words[num];
    }
    else if (num > 10 && num < 20) {
        let numStr = num.toString();
        let n = parseInt(numStr.substring(1, 2));
        let result = adds[1] + words[n];
        return result;
    }
    else if (num > 10) {
        let result = "";
        let numStr = num.toString();
        for (var i = 0; i < numStr.length; ++i) {
            let n = parseInt(numStr.substring(i, i + 1));
            let m = numStr.length - i - 1;
            result += words[n] + adds[m];
        }
        return result;
    }
    else return "零";
}