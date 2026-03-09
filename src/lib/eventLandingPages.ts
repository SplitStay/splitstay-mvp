import { z } from 'zod';

const EventSectionSchema = z.object({
  title: z.string(),
  body: z.array(z.string()),
  steps: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
  bullets: z.array(z.string()).optional(),
  imagePath: z.string().optional(),
  cta: z
    .object({
      text: z.string(),
      subtleNote: z.string().optional(),
    })
    .optional(),
});

export const EventLandingPageConfigSchema = z.object({
  name: z.string(),
  slug: z.string(),
  whatsappMessage: z.string(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
  }),
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    description: z.string(),
    ctaText: z.string(),
    subtleNote: z.string(),
    imagePath: z.string().optional(),
  }),
  sections: z.array(EventSectionSchema),
});

export type EventLandingPageConfig = z.infer<
  typeof EventLandingPageConfigSchema
>;

const configs: EventLandingPageConfig[] = [
  {
    name: 'All Things Go Festival',
    slug: 'all-things-go',
    whatsappMessage: "Hi! I'm going to All Things Go",
    seo: {
      title: 'All Things Go Festival | SplitStay',
      description:
        'Going to All Things Go alone? Find someone else going. Create a profile, see who else is attending, and start a chat before the festival.',
    },
    hero: {
      headline: "POV: You're going to All Things Go… alone.",
      subheadline: 'So you find someone else going.',
      description:
        'Create a profile → see who else is attending → start a chat before the festival.',
      ctaText: 'Find your festival friend',
      subtleNote:
        "Some people also split the hotel if they're both traveling in.",
    },
    sections: [
      {
        title: '',
        body: [
          'Thousands of people go to All Things Go every year.',
          'A lot of them are traveling solo.',
          'Find someone before the festival weekend starts.',
        ],
      },
      {
        title: 'How It Works',
        body: [],
        steps: [
          {
            title: 'Create a profile',
            description: "Tell people you're going to All Things Go.",
          },
          {
            title: 'See who else is going',
            description: 'Browse other festival-goers attending solo.',
          },
          {
            title: 'Start a chat',
            description: 'See if you vibe before the festival weekend.',
          },
          {
            title: 'Find your festival person',
            description: '',
          },
        ],
        cta: {
          text: 'Create Your Profile',
          subtleNote: 'Split the hotel. Split the cost.',
        },
      },
    ],
  },
  {
    name: 'Podcast Movement 2026',
    slug: 'podcast-movement',
    whatsappMessage: "Hi! I'm going to Podcast Movement 2026",
    seo: {
      title: 'Podcast Movement 2026 | SplitStay',
      description:
        'Going to Podcast Movement 2026 alone? Meet another attendee before the conference starts. Grab coffee, attend sessions together, maybe even split the hotel.',
    },
    hero: {
      headline: 'Start Podcast Movement already knowing someone.',
      subheadline:
        'Going to Podcast Movement 2026 alone?\nMeet another attendee before the conference starts.',
      description:
        'Grab coffee, attend sessions together, maybe even split the hotel.',
      ctaText: 'Create your profile',
      subtleNote: 'Most Podcast Movement attendees are traveling solo',
    },
    sections: [
      {
        title: 'Why People Use SplitStay',
        body: [
          'Most people attending Podcast Movement travel solo.',
          'Walking into a big conference without knowing anyone can feel awkward.',
          'SplitStay makes it easy to connect with someone else going before the event.',
        ],
      },
      {
        title: 'How It Works',
        body: [],
        steps: [
          {
            title: 'Create your profile',
            description:
              "Let people know you're attending the Podcast Movement.",
          },
          {
            title: 'See who else is going',
            description: 'Browse other attendees who are traveling solo.',
          },
          {
            title: 'Message and connect',
            description:
              'Meet before the conference and walk in already knowing someone.',
          },
        ],
      },
      {
        title: 'What You Can Do Together',
        body: [],
        bullets: [
          'Grab coffee before sessions',
          'Attend talks together',
          'Meet up after the conference',
          'Share the hotel and split the cost if you both want to',
        ],
        cta: {
          text: 'Create Your Profile',
          subtleNote: 'Most Podcast Movement attendees are traveling solo',
        },
      },
    ],
  },
];

// Validate all configs at module load
export const eventLandingPages: EventLandingPageConfig[] = configs.map(
  (config) => EventLandingPageConfigSchema.parse(config),
);

export function getEventBySlug(
  slug: string,
): EventLandingPageConfig | undefined {
  return eventLandingPages.find((e) => e.slug === slug);
}
