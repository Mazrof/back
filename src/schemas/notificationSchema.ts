import {z} from 'zod';

export const notificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
 image: z.string().optional().default(`https://preview.redd.it/funny-cat-expressions-go-v0-ueiam9zbf2ld1.jpeg?width=1080&crop=smart&auto=webp&s=d67a1cddd672346296f7376c077df7355efaf608`)
});