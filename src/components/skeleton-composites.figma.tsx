import figma from "@figma/code-connect"
import { SkeletonCard, SkeletonStatsCard, SkeletonText, SkeletonAvatar } from "./skeleton-composites"

// SkeletonCard — loading placeholder for card components
// Node ID will be assigned after Figma frame creation
figma.connect(SkeletonCard, "https://www.figma.com/design/AxOnJViNOMcviAAUmcudhA?node-id=TODO-SKELETONCARD", {
  example: () => <SkeletonCard />,
})

// SkeletonStatsCard — loading placeholder for stats card
figma.connect(SkeletonStatsCard, "https://www.figma.com/design/AxOnJViNOMcviAAUmcudhA?node-id=TODO-SKELETONSTATSCARD", {
  example: () => <SkeletonStatsCard />,
})

// SkeletonText — loading placeholder for text blocks
figma.connect(SkeletonText, "https://www.figma.com/design/AxOnJViNOMcviAAUmcudhA?node-id=TODO-SKELETONTEXT", {
  props: {
    lines: figma.enum("Lines", {
      "2": 2,
      "3": 3,
      "4": 4,
    }),
  },
  example: ({ lines }) => <SkeletonText lines={lines} />,
})

// SkeletonAvatar — loading placeholder for avatar
figma.connect(SkeletonAvatar, "https://www.figma.com/design/AxOnJViNOMcviAAUmcudhA?node-id=TODO-SKELETONAVATAR", {
  props: {
    size: figma.enum("Size", {
      Small: "sm",
      Medium: "md",
      Large: "lg",
    }),
  },
  example: ({ size }) => <SkeletonAvatar size={size} />,
})
