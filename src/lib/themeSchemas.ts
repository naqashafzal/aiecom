export type FieldType = "text" | "color" | "url" | "category" | "number" | "boolean" | "textarea";

export interface SchemaField {
  id: string;
  label: string;
  type: FieldType;
  default?: any;
  placeholder?: string;
  helpText?: string;
}

export interface BlockSchema {
  type: string;
  name: string;
  icon: string;
  fields: SchemaField[];
}

export interface SectionSchema {
  type: string;
  name: string;
  icon: string; // matches lucide-react names roughly
  fields: SchemaField[];
  allowedBlocks?: string[]; // If undefined, all blocks allowed
  maxBlocks?: number;
}

export const BlockSchemas: BlockSchema[] = [
  {
    type: "text",
    name: "Text Content",
    icon: "Type",
    fields: [
      { id: "content", label: "Text Content", type: "textarea", default: "Text goes here" },
      { id: "font_size", label: "Font Size (px)", type: "number", default: 16 },
      { id: "color", label: "Text Color", type: "color", default: "#000000" },
      { id: "font_weight", label: "Font Weight", type: "text", default: "normal" }
    ]
  },
  {
    type: "image",
    name: "Image",
    icon: "ImageIcon",
    fields: [
      { id: "url", label: "Image URL", type: "url", default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500" },
      { id: "alt", label: "Alt Text", type: "text", default: "" },
      { id: "width", label: "Width (px or %)", type: "text", default: "100%" },
      { id: "height", label: "Height (px or auto)", type: "text", default: "auto" }
    ]
  },
  {
    type: "button",
    name: "Button",
    icon: "Type",
    fields: [
      { id: "label", label: "Button Label", type: "text", default: "Click Here" },
      { id: "url", label: "Button Link", type: "url", default: "/" },
      { id: "bg_color", label: "Background Color", type: "color", default: "#0071FF" },
      { id: "text_color", label: "Text Color", type: "color", default: "#FFFFFF" }
    ]
  },
  {
    type: "row",
    name: "Row Container",
    icon: "LayoutGrid",
    fields: [
      { id: "columns", label: "Number of Columns", type: "number", default: 2 },
      { id: "gap", label: "Gap (px)", type: "number", default: 16 }
    ]
  },
  {
    type: "coupon",
    name: "Coupon Block",
    icon: "Type",
    fields: [
      { id: "title", label: "Coupon Title", type: "text", default: "US $65 OFF" },
      { id: "req", label: "Requirement", type: "text", default: "orders US $469+" },
      { id: "code", label: "Code", type: "text", default: "Code:AESS07" }
    ]
  },
  {
    type: "category_link",
    name: "Category Link",
    icon: "Type",
    fields: [
      { id: "category_id", label: "Select Category", type: "category" },
      { id: "custom_text", label: "Custom Text (Overrides Category Name)", type: "text", default: "" }
    ]
  }
];

export const AliExpressThemeSchema: SectionSchema[] = [
  {
    type: "custom_html",
    name: "Custom HTML",
    icon: "Type",
    fields: [
      { id: "html_content", label: "Custom HTML Code", type: "textarea", default: "<div>Hello World!</div>" },
      { id: "bg", label: "Background Color", type: "color", default: "transparent" },
      { id: "pt", label: "Top Padding (px)", type: "number", default: 48 },
      { id: "pb", label: "Bottom Padding (px)", type: "number", default: 48 },
      { id: "width", label: "Container Width", type: "text", default: "container" }
    ]
  },
  {
    type: "hero",
    name: "Summer Sale Banner",
    icon: "ImageIcon",
    fields: [
      { id: "bg_color", label: "Background Color", type: "color", default: "#0071FF" },
      { id: "countdown", label: "Sale Ends Countdown Text", type: "text", default: "Jun 11, 11:59 (GMT+5)" },
      { id: "discount", label: "Discount Title", type: "text", default: "UP TO 80% OFF" },
      { id: "side_image", label: "Side Graphic Image URL", type: "url", default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500" },
    ]
  },
  {
    type: "deals",
    name: "Today's Deals",
    icon: "LayoutGrid",
    fields: [
      { id: "bg", label: "Background Color", type: "color", default: "transparent" },
      { id: "pt", label: "Top Padding (px)", type: "number", default: 48 },
      { id: "pb", label: "Bottom Padding (px)", type: "number", default: 48 },
      { id: "width", label: "Container Width (container or full)", type: "text", default: "container" },
      { id: "bestsellers_title", label: "Bestsellers Title", type: "text", default: "Bestsellers" },
      { id: "bestsellers_subtitle", label: "Bestsellers Subtitle", type: "text", default: "Top price & quality picks >" },
      { id: "bestsellers_category_id", label: "Bestsellers Category", type: "category" },
      { id: "superdeals_title", label: "SuperDeals Title", type: "text", default: "SuperDeals" },
      { id: "superdeals_subtitle", label: "SuperDeals Subtitle", type: "text", default: "Up to 80% off >" },
      { id: "superdeals_category_id", label: "SuperDeals Category", type: "category" },
    ]
  },
  {
    type: "new_arrivals",
    name: "New Arrivals",
    icon: "LayoutGrid",
    fields: [
      { id: "bg", label: "Background Color", type: "color", default: "transparent" },
      { id: "pt", label: "Top Padding (px)", type: "number", default: 48 },
      { id: "pb", label: "Bottom Padding (px)", type: "number", default: 48 },
      { id: "width", label: "Container Width", type: "text", default: "container" },
      { id: "title", label: "Title", type: "text", default: "New Arrivals" },
    ]
  },
  {
    type: "more_to_love",
    name: "More to love",
    icon: "LayoutGrid",
    fields: [
      { id: "bg", label: "Background Color", type: "color", default: "transparent" },
      { id: "pt", label: "Top Padding (px)", type: "number", default: 48 },
      { id: "pb", label: "Bottom Padding (px)", type: "number", default: 48 },
      { id: "width", label: "Container Width", type: "text", default: "container" },
      { id: "title", label: "Title", type: "text", default: "More to love" },
    ]
  },
  {
    type: "custom_builder",
    name: "Custom Builder Section",
    icon: "LayoutGrid",
    fields: [
      { id: "bg", label: "Background Color", type: "color", default: "transparent" },
      { id: "pt", label: "Top Padding (px)", type: "number", default: 48 },
      { id: "pb", label: "Bottom Padding (px)", type: "number", default: 48 },
      { id: "width", label: "Container Width", type: "text", default: "container" }
    ]
  }
];

export const ElegantThemeSchema: SectionSchema[] = [
  {
    type: "custom_html",
    name: "Custom HTML",
    icon: "Type",
    fields: [
      { id: "html_content", label: "Custom HTML Code", type: "textarea", default: "<div>Hello World!</div>" },
      { id: "bg", label: "Background Color", type: "color", default: "transparent" },
      { id: "pt", label: "Top Padding (px)", type: "number", default: 48 },
      { id: "pb", label: "Bottom Padding (px)", type: "number", default: 48 },
      { id: "width", label: "Container Width", type: "text", default: "container" }
    ]
  },
  {
    type: "elegant_hero",
    name: "Hero Banner",
    icon: "ImageIcon",
    fields: [
      { id: "title", label: "Banner Title", type: "text", default: "LAMPS BY YZ" },
      { id: "image", label: "Banner Image URL", type: "url", default: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1500" },
    ]
  },
  {
    type: "elegant_categories",
    name: "Top Categories",
    icon: "LayoutGrid",
    fields: [
      { id: "title", label: "Section Title", type: "text", default: "TOP CATEGORY" },
      { id: "subtitle", label: "Subtitle", type: "text", default: "Most Viewed Categories with Affordable Prices" }
    ]
  },
  {
    type: "elegant_best_sellers",
    name: "Best Sellers",
    icon: "LayoutGrid",
    fields: [
      { id: "title", label: "Section Title", type: "text", default: "BEST SELLERS" }
    ]
  },
  {
    type: "custom_builder",
    name: "Custom Builder Section",
    icon: "LayoutGrid",
    fields: [
      { id: "bg", label: "Background Color", type: "color", default: "transparent" },
      { id: "pt", label: "Top Padding (px)", type: "number", default: 48 },
      { id: "pb", label: "Bottom Padding (px)", type: "number", default: 48 },
    ]
  },
  {
    type: "elegant_story",
    name: "Brand Story",
    icon: "LayoutTemplate",
    fields: [
      { id: "title", label: "Title", type: "text", default: "Our Philosophy" },
      { id: "description", label: "Description", type: "textarea", default: "We believe in creating timeless pieces that bring warmth, elegance, and beauty to your everyday spaces. Every item is crafted with passion and meticulous attention to detail." },
      { id: "image", label: "Story Image URL", type: "url", default: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000" },
      { id: "buttonText", label: "Button Text", type: "text", default: "Discover More" },
      { id: "buttonLink", label: "Button Link", type: "text", default: "/about" },
      { id: "imagePosition", label: "Image Position (left or right)", type: "text", default: "left" }
    ]
  },
  {
    type: "elegant_features",
    name: "Value Propositions",
    icon: "CheckCircle2",
    fields: [
      { id: "title", label: "Section Title (Optional)", type: "text", default: "" },
      { id: "bg", label: "Background Color", type: "color", default: "#FAFAFA" },
    ]
  },
  {
    type: "elegant_newsletter",
    name: "Newsletter Signup",
    icon: "Mail",
    fields: [
      { id: "title", label: "Heading", type: "text", default: "Join Our Inner Circle" },
      { id: "subtitle", label: "Subheading", type: "text", default: "Subscribe to receive updates, access to exclusive deals, and more." },
      { id: "bg", label: "Background Color", type: "color", default: "#111111" },
      { id: "textColor", label: "Text Color", type: "color", default: "#FFFFFF" }
    ]
  }
];

export const MarketplaceThemeSchema: SectionSchema[] = [
  {
    type: "custom_html",
    name: "Custom HTML",
    icon: "Type",
    fields: [
      { id: "html_content", label: "Custom HTML Code", type: "textarea", default: "<div>Hello World!</div>" },
      { id: "bg", label: "Background Color", type: "color", default: "transparent" },
      { id: "pt", label: "Top Padding (px)", type: "number", default: 48 },
      { id: "pb", label: "Bottom Padding (px)", type: "number", default: 48 },
      { id: "width", label: "Container Width", type: "text", default: "container" }
    ]
  },
  {
    type: "marketplace_sidebar",
    name: "Vertical Menu",
    icon: "MenuSquare",
    fields: [
      { id: "title", label: "Sidebar Title", type: "text", default: "Categories", helpText: "To customize categories and their text, click '+ Add block' below to add 'Category Link' blocks. If no blocks are added, all categories will be shown automatically." }
    ],
    allowedBlocks: ["category_link"]
  },
  {
    type: "marketplace_hero",
    name: "Hero Carousel",
    icon: "ImageIcon",
    fields: [
      { id: "image", label: "Hero Image URL", type: "url", default: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000" },
      { id: "title", label: "Hero Title", type: "text", default: "Biggest Sale of the Year" },
      { id: "subtitle", label: "Hero Subtitle", type: "text", default: "Up to 80% off on all electronics and fashion items!" },
      { id: "buttonText", label: "Button Text", type: "text", default: "SHOP NOW" },
      { id: "buttonLink", label: "Button Link", type: "text", default: "/products" }
    ]
  },
  {
    type: "marketplace_flash_sales",
    name: "Flash Sales",
    icon: "LayoutGrid",
    fields: [
      { id: "title", label: "Section Title", type: "text", default: "Flash Sales" },
    ]
  },
  {
    type: "marketplace_official_stores",
    name: "Official Stores",
    icon: "LayoutGrid",
    fields: [
      { id: "title", label: "Section Title", type: "text", default: "Official Stores" },
    ]
  },
  {
    type: "marketplace_just_for_you",
    name: "Just For You",
    icon: "LayoutGrid",
    fields: [
      { id: "title", label: "Section Title", type: "text", default: "Just For You" },
    ]
  },
  {
    type: "custom_builder",
    name: "Custom Builder Section",
    icon: "LayoutGrid",
    fields: [
      { id: "bg", label: "Background Color", type: "color", default: "transparent" },
      { id: "pt", label: "Top Padding (px)", type: "number", default: 48 },
      { id: "pb", label: "Bottom Padding (px)", type: "number", default: 48 },
    ]
  }
];

export interface ThemeConfig {
  order: string[];
  sections: Record<string, {
    type: string;
    settings: Record<string, any>;
    block_order?: string[];
    blocks?: Record<string, {
      type: string;
      settings: Record<string, any>;
    }>;
  }>;
}

export const defaultAliExpressConfig: ThemeConfig = {
  order: ["hero_default", "deals_default", "new_arrivals_default", "more_to_love_default"],
  sections: {
    "hero_default": { 
      type: "hero", 
      settings: {},
      block_order: ["coupon_1", "coupon_2", "coupon_3"],
      blocks: {
        "coupon_1": { type: "coupon", settings: { title: "US $65 OFF", req: "orders US $469+", code: "Code:AESS07" } },
        "coupon_2": { type: "coupon", settings: { title: "US $24 OFF", req: "orders US $169+", code: "Code:AESS05" } },
        "coupon_3": { type: "coupon", settings: { title: "US $15 OFF", req: "orders US $99+", code: "Code:AESS04" } }
      }
    },
    "deals_default": { type: "deals", settings: {}, block_order: [], blocks: {} },
    "new_arrivals_default": { type: "new_arrivals", settings: {}, block_order: [], blocks: {} },
    "more_to_love_default": { type: "more_to_love", settings: {}, block_order: [], blocks: {} }
  }
};

export const defaultElegantConfig: ThemeConfig = {
  order: [
    "elegant_hero_default", 
    "elegant_features_default",
    "elegant_categories_default", 
    "elegant_story_default",
    "elegant_best_sellers_default",
    "elegant_newsletter_default"
  ],
  sections: {
    "elegant_hero_default": { type: "elegant_hero", settings: {}, block_order: [], blocks: {} },
    "elegant_features_default": { type: "elegant_features", settings: {}, block_order: [], blocks: {} },
    "elegant_categories_default": { type: "elegant_categories", settings: {}, block_order: [], blocks: {} },
    "elegant_story_default": { type: "elegant_story", settings: {}, block_order: [], blocks: {} },
    "elegant_best_sellers_default": { type: "elegant_best_sellers", settings: {}, block_order: [], blocks: {} },
    "elegant_newsletter_default": { type: "elegant_newsletter", settings: {}, block_order: [], blocks: {} }
  }
};

export const defaultMarketplaceConfig: ThemeConfig = {
  order: ["marketplace_sidebar_default", "marketplace_hero_default", "marketplace_flash_sales_default", "marketplace_official_stores_default", "marketplace_just_for_you_default"],
  sections: {
    "marketplace_sidebar_default": { type: "marketplace_sidebar", settings: {}, block_order: [], blocks: {} },
    "marketplace_hero_default": { type: "marketplace_hero", settings: {}, block_order: [], blocks: {} },
    "marketplace_flash_sales_default": { type: "marketplace_flash_sales", settings: {}, block_order: [], blocks: {} },
    "marketplace_official_stores_default": { type: "marketplace_official_stores", settings: {}, block_order: [], blocks: {} },
    "marketplace_just_for_you_default": { type: "marketplace_just_for_you", settings: {}, block_order: [], blocks: {} }
  }
};
