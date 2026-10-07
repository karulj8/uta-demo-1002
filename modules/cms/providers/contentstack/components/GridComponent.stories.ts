import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type {
  GridComponent as GridComponentType,
  SectionComponent as SectionComponentType,
  TextComponent as TextComponentType,
} from '../types/gen/contentstack'
import GridComponent from './GridComponent.vue'

/**
 * Contentstack Grid component creates flexible grid layouts with configurable columns and gaps.
 * It renders child content elements in a responsive CSS Grid with customizable spacing for desktop and mobile.
 *
 * Key features:
 * - Responsive column configuration (1-6 columns) for desktop and mobile
 * - Flexible gap controls (none, small, medium, large) for both row and column spacing
 * - Automatic centering of grid items with justify-items-center
 * - Support for any Contentstack component type as grid content
 */

type ColumnSpace = 'none' | 'small' | 'medium' | 'large'
type VerticalAlignment = 'Top' | 'Middle' | 'Bottom'
type HorizontalAlignment = 'Left' | 'Center' | 'Right'

interface GridStoryArgs {
  numberOfColumnsDesktop: 1 | 2 | 3 | 4 | 5 | 6
  numberOfColumnsMobile: 1 | 2 | 3
  gapColumnDesktop: ColumnSpace
  gapColumnMobile: ColumnSpace
  gapRowDesktop: ColumnSpace
  gapRowMobile: ColumnSpace
  verticalContentAlignment: VerticalAlignment
  horizontalContentAlignment: HorizontalAlignment
  columnContent: GridComponentType['content']
}

const createContentElement = (
  numberOfColumnsDesktop: 1 | 2 | 3 | 4 | 5 | 6 = 2,
  numberOfColumnsMobile: 1 | 2 | 3 = 1,
  gapColumnDesktop: ColumnSpace = 'medium',
  gapColumnMobile: ColumnSpace = 'small',
  gapRowDesktop: ColumnSpace = 'medium',
  gapRowMobile: ColumnSpace = 'small',
  verticalContentAlignment: VerticalAlignment = 'Top',
  horizontalContentAlignment: HorizontalAlignment = 'Center',
  columnContent: GridComponentType['content'] = [],
): GridComponentType =>
  ({
    desktop: {
      number_of_columns_desktop: numberOfColumnsDesktop,
      gap_column_desktop: gapColumnDesktop,
      gap_row_desktop: gapRowDesktop,
    },
    mobile: {
      number_of_columns_mobile: numberOfColumnsMobile,
      gap_column_mobile: gapColumnMobile,
      gap_row_mobile: gapRowMobile,
    },
    vertical_content_alignment: verticalContentAlignment,
    horizontal_content_alignmen: horizontalContentAlignment,
    content: columnContent,
    $: undefined,
  }) as unknown as GridComponentType

const meta = {
  title: 'CMS Contentstack/Grid',
  component: GridComponent,
  argTypes: {
    numberOfColumnsDesktop: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
      description: 'Number of columns on desktop',
      name: 'contentElement.desktop.number_of_columns_desktop',
    },
    numberOfColumnsMobile: {
      control: 'select',
      options: [1, 2, 3],
      description: 'Number of columns on mobile',
      name: 'contentElement.mobile.number_of_columns_mobile',
    },
    gapColumnDesktop: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
      description: 'Column gap size on desktop',
      name: 'contentElement.desktop.gap_column_desktop',
    },
    gapColumnMobile: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
      description: 'Column gap size on mobile',
      name: 'contentElement.mobile.gap_column_mobile',
    },
    gapRowDesktop: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
      description: 'Row gap size on desktop',
      name: 'contentElement.desktop.gap_row_desktop',
    },
    gapRowMobile: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
      description: 'Row gap size on mobile',
      name: 'contentElement.mobile.gap_row_mobile',
    },
    verticalContentAlignment: {
      control: 'select',
      options: ['Top', 'Middle', 'Bottom'],
      description: 'Vertical alignment of content within grid items',
      name: 'contentElement.vertical_content_alignment',
    },
    horizontalContentAlignment: {
      control: 'select',
      options: ['Left', 'Center', 'Right'],
      description: 'Horizontal alignment of content within grid items',
      name: 'contentElement.horizontal_content_alignmen',
    },
    columnContent: {
      control: 'object',
      description: 'Array of content items to display in the grid',
      name: 'contentElement.content',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <GridComponent :contentElement="contentElement" />
          </template>
        `,
      },
      description: {
        component:
          'A flexible grid component for arranging content elements in responsive columns with customizable gaps and alignment.',
      },
    },
  },
  render: (args: GridStoryArgs) => {
    return {
      components: { GridComponent },
      setup() {
        const contentElement = computed(() =>
          createContentElement(
            args.numberOfColumnsDesktop,
            args.numberOfColumnsMobile,
            args.gapColumnDesktop,
            args.gapColumnMobile,
            args.gapRowDesktop,
            args.gapRowMobile,
            args.verticalContentAlignment,
            args.horizontalContentAlignment,
            args.columnContent,
          ),
        )
        return {
          contentElement,
        }
      },
      template: `
        <div class="w-full p-4">
          <GridComponent :contentElement="contentElement" />
        </div>
      `,
    }
  },
}

export default meta

type Story = StoryObj<GridStoryArgs>

// Mock section components with different backgrounds
const mockSectionLight = {
  uid: 'section-light-1',
  _content_type_uid: 'section-component',
  background_color: '#f8fafc',
  padding: 'medium',
  content: [
    {
      uid: 'text-content-1',
      _content_type_uid: 'text-component',
      content: 'Light Background Section',
      text_type: 'h3',
    } as TextComponentType,
    {
      uid: 'text-content-2',
      _content_type_uid: 'text-component',
      content:
        'This section has a light gray background with some sample content to demonstrate the grid layout.',
      text_type: 'p',
    } as TextComponentType,
  ],
} as unknown as SectionComponentType

const mockSectionDark = {
  uid: 'section-dark-1',
  _content_type_uid: 'section-component',
  background_color: '#1e293b',
  padding: 'medium',
  content: [
    {
      uid: 'text-content-3',
      _content_type_uid: 'text-component',
      content: 'Dark Background Section',
      text_type: 'h3',
    } as TextComponentType,
    {
      uid: 'text-content-4',
      _content_type_uid: 'text-component',
      content:
        'This section features a dark background to show contrast in the grid layout.',
      text_type: 'p',
    } as TextComponentType,
  ],
} as unknown as SectionComponentType

const mockSectionPrimary = {
  uid: 'section-primary-1',
  _content_type_uid: 'section-component',
  background_color: '#3b82f6',
  padding: 'medium',
  content: [
    {
      uid: 'text-content-5',
      _content_type_uid: 'text-component',
      content: 'Primary Color Section',
      text_type: 'h3',
    } as TextComponentType,
    {
      uid: 'text-content-6',
      _content_type_uid: 'text-component',
      content:
        'A vibrant blue section that stands out in the grid arrangement.',
      text_type: 'p',
    } as TextComponentType,
  ],
} as unknown as SectionComponentType

const mockSectionAccent = {
  uid: 'section-accent-1',
  _content_type_uid: 'section-component',
  background_color: '#10b981',
  padding: 'medium',
  content: [
    {
      uid: 'text-content-7',
      _content_type_uid: 'text-component',
      content: 'Accent Section',
      text_type: 'h3',
    } as TextComponentType,
    {
      uid: 'text-content-8',
      _content_type_uid: 'text-component',
      content: 'Green accent section for visual variety in the grid.',
      text_type: 'p',
    } as TextComponentType,
  ],
} as unknown as SectionComponentType

/**
 * Two column grid with mixed content sections
 */
export const TwoColumns: Story = {
  args: {
    numberOfColumnsDesktop: 2,
    numberOfColumnsMobile: 1,
    gapColumnDesktop: 'medium',
    gapRowDesktop: 'medium',
    gapColumnMobile: 'small',
    gapRowMobile: 'small',
    verticalContentAlignment: 'Top',
    horizontalContentAlignment: 'Center',
    columnContent: [
      mockSectionLight,
      mockSectionDark,
      mockSectionPrimary,
      mockSectionAccent,
    ],
  },
}

/**
 * Three column grid layout
 */
export const ThreeColumns: Story = {
  args: {
    numberOfColumnsDesktop: 3,
    numberOfColumnsMobile: 1,
    gapColumnDesktop: 'small',
    gapRowDesktop: 'small',
    gapColumnMobile: 'small',
    gapRowMobile: 'small',
    verticalContentAlignment: 'Top',
    horizontalContentAlignment: 'Center',
    columnContent: [
      mockSectionLight,
      mockSectionDark,
      mockSectionPrimary,
      mockSectionAccent,
      mockSectionLight,
      mockSectionDark,
    ],
  },
}

/**
 * Grid with large gaps
 */
export const LargeGaps: Story = {
  args: {
    numberOfColumnsDesktop: 2,
    numberOfColumnsMobile: 2,
    gapColumnDesktop: 'large',
    gapRowDesktop: 'large',
    gapColumnMobile: 'medium',
    gapRowMobile: 'medium',
    verticalContentAlignment: 'Top',
    horizontalContentAlignment: 'Center',
    columnContent: [
      mockSectionLight,
      mockSectionDark,
      mockSectionPrimary,
      mockSectionAccent,
    ],
  },
}

/**
 * Grid with no gaps
 */
export const NoGaps: Story = {
  args: {
    numberOfColumnsDesktop: 3,
    numberOfColumnsMobile: 2,
    gapColumnDesktop: 'none',
    gapRowDesktop: 'none',
    gapColumnMobile: 'none',
    gapRowMobile: 'none',
    verticalContentAlignment: 'Top',
    horizontalContentAlignment: 'Center',
    columnContent: [mockSectionLight, mockSectionDark, mockSectionPrimary],
  },
}
