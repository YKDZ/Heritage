export interface BannerConfig {
    id: number
    imgURL: string
    linkedPostId: number
}

export const bannerConfigs: BannerConfig[] = [
    {
        id: 1,
        imgURL: "/banner/1.jpg",
        linkedPostId: 215,
    },
    {
        id: 2,
        imgURL: "/banner/2.jpg",
        linkedPostId: 204,
    }
]