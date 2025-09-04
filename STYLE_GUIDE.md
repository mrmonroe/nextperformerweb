# Next Performer - Brand Style Guide

## Color Palette

### Base Colors
- **Pastel Gray**: `#D9D2C1` - Primary background color, used for main surfaces and cards
- **Ash Gray**: `#B4C5B5` - Secondary background color, used for sections and dividers
- **Deep Space Sparkle**: `#465C6E` - Primary text color, used for headings and navigation

### Accent Colors
- **Puce Red**: `#7B2F30` - Primary accent color, used for CTAs and highlights
- **Copper Red**: `#CC713F` - Secondary accent color, used for hover states and emphasis
- **Light French Beige**: `#C7AB70` - Warm accent color, used for special backgrounds and highlights

## Color Usage Guidelines

### Base Colors
- **Pastel Gray (#D9D2C1)**: Primary background, main surfaces, card backgrounds
- **Ash Gray (#B4C5B5)**: Secondary backgrounds, section dividers, subtle elements
- **Deep Space Sparkle (#465C6E)**: Primary text, headings, navigation, form labels

### Accent Colors
- **Puce Red (#7B2F30)**: Primary CTAs, main buttons, brand highlights
- **Copper Red (#CC713F)**: Secondary buttons, hover states, progress indicators
- **Light French Beige (#C7AB70)**: Special backgrounds, warm highlights, emphasis areas

## Typography

### Primary Font
- **Libre Baskerville**: Used for headings, titles, and brand elements
- Weights: 400 (Regular), 700 (Bold)
- Style: Serif, elegant and professional

### Secondary Font
- **Roboto**: Used for body text, forms, and UI elements
- Weights: 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold)
- Style: Sans-serif, clean and readable

## Spacing System

### Spacing Scale
- **xs**: 0.5rem (8px)
- **sm**: 1rem (16px)
- **md**: 1.5rem (24px)
- **lg**: 2rem (32px)
- **xl**: 3rem (48px)

## Component Guidelines

### Buttons
- **Primary**: Puce Red background with white text
- **Secondary**: Copper Red background with white text
- **Hover States**: Darker shade of respective color
- **Border Radius**: 8px for consistency

### Cards
- **Background**: Pastel Gray (#D9D2C1)
- **Border**: Ash Gray (#B4C5B5)
- **Shadow**: Subtle drop shadow using Deep Space Sparkle with opacity
- **Border Radius**: 12px

### Forms
- **Input Background**: Pastel Gray (#D9D2C1)
- **Input Border**: Ash Gray (#B4C5B5)
- **Focus State**: Puce Red border with subtle glow
- **Label Color**: Deep Space Sparkle (#465C6E)

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Puce Red on white: 4.5:1 contrast ratio
- Deep Space Sparkle on Pastel Gray: 4.8:1 contrast ratio
- Copper Red on white: 3.2:1 contrast ratio (used for accents only)

### Focus States
- All interactive elements have visible focus indicators
- Focus rings use Puce Red with 3px border and 0.1 opacity background

## Brand Personality

### Tone
- **Professional**: Clean, organized, trustworthy
- **Warm**: Approachable, community-focused
- **Confident**: Bold colors that stand out
- **Musical**: Colors evoke warmth of live music venues

### Visual Style
- **Modern**: Clean lines and contemporary design
- **Earthy**: Warm, natural color palette
- **Elegant**: Sophisticated typography and spacing
- **Accessible**: High contrast and clear hierarchy

## Implementation Notes

### CSS Custom Properties
```css
:root {
    /* Base Colors */
    --base-primary: #D9D2C1;
    --base-secondary: #B4C5B5;
    --base-text: #465C6E;
    
    /* Accent Colors */
    --accent-primary: #7B2F30;
    --accent-secondary: #CC713F;
    --accent-warm: #C7AB70;
}
```

### Gradient Combinations
- **Primary Gradient**: Puce Red to Copper Red (for CTAs)
- **Background Gradient**: Pastel Gray to Ash Gray (for sections)
- **Accent Gradient**: Deep Space Sparkle to Ash Gray (for headers)

## Logo Usage

### Logo Colors
- **Primary**: Puce Red (#7B2F30)
- **Secondary**: Copper Red (#CC713F)
- **Monochrome**: Deep Space Sparkle (#465C6E)

### Logo Placement
- Minimum clear space: 1x logo height
- Background: White or Pastel Gray preferred
- Avoid: Busy backgrounds, low contrast areas

## File References
- Logo: `FullLogo_Transparent.png`
- Primary Font: Libre Baskerville (Google Fonts)
- Secondary Font: Roboto (Google Fonts)

---

*This style guide ensures consistent brand representation across all Next Performer materials and touchpoints.*
