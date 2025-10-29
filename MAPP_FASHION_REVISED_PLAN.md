# **Mapp Fashion Platform - Revised Plan**

## **Business Model**
- **Target Customers**: Fashion e-commerce shops
- **Product**: White-labeled marketing automation platform
- **Key Differentiator**: AI-powered, fashion-specific automation with ready-to-go campaigns

---

## **Core Platform Changes**

### 1. **White-Label Rebranding & UI Restyling**
**Priority**: High | **Phase**: 1

**What:**
- Custom branding system (logo, colors, fonts per workspace)
- Fashion-focused UI/UX redesign
- Simplified onboarding for fashion retailers
- Remove/hide Dittofeed branding

**Technical Approach:**
```
packages/
├── mapp-dashboard/          # Forked & restyled dashboard
├── mapp-branding/           # Theme engine & white-label config
└── mapp-onboarding/         # Custom onboarding flows
```

**Dittofeed Extension Point:** Fork `packages/dashboard`, create custom theme layer

---

### 2. **Kafka Stream Integration**
**Priority**: Critical | **Phase**: 1

**What:**
- Kafka consumer service to ingest client website events
- Real-time event processing into Dittofeed's event system
- Event types: `product_view`, `add_to_cart`, `purchase`, `wishlist_add`, `search`, etc.

**Technical Approach:**
```typescript
// New service
services/kafka-consumer/
├── eventMapper.ts          // Map Kafka events → Dittofeed events
├── streamProcessor.ts      // Kafka stream consumer
└── userProfileEnricher.ts  // Update user properties in real-time
```

**Dittofeed Extension Point:** `packages/backend-lib/src/userEvents` + new Kafka integration in `integrations/`

**Events to Capture:**
- Product views (with product metadata)
- Cart additions/removals
- Purchases
- Search queries
- Category browsing
- Wishlist additions
- Size/color selections

---

### 3. **Product Feed Management**
**Priority**: Critical | **Phase**: 1

**What:**
- Product catalog import (CSV, JSON, Shopify API, WooCommerce)
- Product feed configuration UI
- Automatic sync (daily/hourly)
- Product metadata storage (SKU, images, prices, categories, sizes, colors, stock levels)

**Technical Approach:**
```
packages/
├── product-catalog/
│   ├── feedParser.ts       // Parse various feed formats
│   ├── productSync.ts      // Sync service with scheduling
│   ├── productSchema.ts    // Product data model
│   └── api/                // Product CRUD APIs
└── mapp-dashboard/
    └── pages/product-feeds/ // Feed config UI
```

**Database Schema:**
```typescript
// New tables in PostgreSQL
products {
  workspace_id: uuid
  product_id: string (SKU)
  name: string
  description: text
  price: decimal
  sale_price: decimal
  image_url: string
  category: string[]
  subcategory: string[]
  brand: string
  colors: string[]
  sizes: string[]
  in_stock: boolean
  stock_level: int
  gender: enum
  style_tags: string[]  // casual, formal, bohemian, etc.
  created_at: timestamp
  updated_at: timestamp
}
```

**Dittofeed Extension Point:** New integration in `packages/backend-lib/src/integrations/productFeed/`

---

### 4. **AI-Powered Product Recommendations**
**Priority**: High | **Phase**: 2

**What:**
- Multiple recommendation strategies
- Template variables for dynamic product injection
- Real-time recommendation generation

**Recommendation Engines:**

#### **4.1. Collaborative Filtering**
- "Customers who bought X also bought Y"
- Based on purchase patterns across all clients

#### **4.2. Content-Based Recommendations**
- Similar products by attributes (category, color, style, price range)
- "Complete the look" outfits

#### **4.3. Personalized Recommendations**
- Based on user's browsing/purchase history
- Price range affinity
- Brand affinity
- Style preference

#### **4.4. AI-Enhanced Recommendations** (Optional/Premium)
- OpenAI embeddings for semantic product similarity
- Visual similarity using image embeddings
- Trend detection and trending product suggestions

**Technical Approach:**
```
packages/
└── recommendation-engine/
    ├── strategies/
    │   ├── collaborative.ts
    │   ├── contentBased.ts
    │   ├── personalized.ts
    │   └── aiEnhanced.ts
    ├── templateVariables.ts  // Liquid template vars
    └── api/                  // Recommendation endpoints
```

**Template Usage:**
```liquid
<!-- In email templates -->
{% for product in recommended_products limit:4 %}
  <div class="product">
    <img src="{{ product.image_url }}" />
    <h3>{{ product.name }}</h3>
    <p>{{ product.price }}</p>
    <a href="{{ product.url }}">Shop Now</a>
  </div>
{% endfor %}
```

**Dittofeed Extension Point:** Extend `packages/isomorphic-lib/src/messageTemplates.ts` with custom template variables

---

### 5. **Pre-Built Fashion Automation Templates**
**Priority**: Critical | **Phase**: 2

**Ready-to-Go Journeys:**

#### **5.1. Welcome Series**
- Email 1: Welcome + brand story (immediate)
- Email 2: Style quiz or preference capture (Day 1)
- Email 3: Personalized recommendations (Day 3)
- Email 4: First purchase discount (Day 7)

#### **5.2. Abandoned Cart Recovery**
- Trigger: Cart abandoned for 1 hour
- Email 1: "You left items behind" + cart contents (1 hour)
- Email 2: "Still interested?" + similar products (24 hours)
- Email 3: "Last chance" + discount code (48 hours)

#### **5.3. Abandoned Browse Recovery**
- Trigger: Viewed products but didn't add to cart
- Email: "You might also like" + viewed products + recommendations (24 hours)

#### **5.4. Post-Purchase Series**
- Email 1: Order confirmation with styling tips (immediate)
- Email 2: "Complete your look" recommendations (3 days)
- Email 3: Review request (7 days)
- Email 4: "You might also like" based on purchase (14 days)

#### **5.5. Replenishment Campaigns**
- For consumable fashion items (activewear, basics, socks)
- Trigger after typical replacement cycle

#### **5.6. New Arrivals**
- Weekly/Bi-weekly digest of new products
- Personalized to user's style preferences and browsing history
- Segment: Active subscribers

#### **5.7. Back-in-Stock Alerts**
- Trigger: Product comes back in stock (size-specific)
- Target: Users who viewed out-of-stock items

#### **5.8. Price Drop Alerts**
- Trigger: Price drops on viewed/wishlisted items
- Target: Users who viewed but didn't purchase

#### **5.9. Seasonal Collections**
- Trigger: Seasonal launches (Spring, Summer, Fall, Winter)
- Personalized product selection based on user profile

#### **5.10. VIP/Loyalty Program**
- Segment high-value customers
- Exclusive early access to sales and new collections
- Birthday/anniversary emails with special offers

#### **5.11. Win-Back Campaign**
- Trigger: No engagement for 30/60/90 days
- Progressive incentives to re-engage

#### **5.12. Trend-Based Campaigns**
- "This week's trending items"
- AI-detected trending styles across the catalog
- Personalized trending picks

**Technical Approach:**
```
packages/
└── mapp-templates/
    ├── journeys/            # JSON journey definitions
    ├── segments/            # Pre-configured segments
    ├── email-templates/     # HTML/MJML templates
    └── automation-library/  # Template gallery UI
```

**Implementation:**
- Export journeys as JSON from Dittofeed
- Create import/clone functionality
- "Automation Library" UI in dashboard
- One-click deployment with customization

**Dittofeed Extension Point:** Use Dittofeed's journey export/import + create custom template gallery

---

### 6. **AI Features Throughout Platform**
**Priority**: Medium | **Phase**: 2-3

#### **6.1. AI Subject Line Generation**
- Generate A/B test subject line variants
- Fashion-specific copywriting

#### **6.2. AI Email Content Generation**
- Product description enhancement
- Campaign copy generation
- Seasonal campaign ideas

#### **6.3. AI Segmentation Assistant**
- Natural language segment creation
- "Create a segment for users who bought dresses in the last 30 days"

#### **6.4. AI-Powered Send Time Optimization**
- Learn optimal send times per user
- Maximize open rates

#### **6.5. AI Trend Detection**
- Analyze product views/purchases across clients
- Surface trending categories, colors, styles
- Suggest timely campaigns

#### **6.6. Smart Product Tagging**
- Auto-tag products with style attributes
- Visual analysis of product images
- Extract: style (casual, formal), occasion, season, etc.

**Technical Approach:**
```
packages/
└── mapp-ai/
    ├── openai/
    │   ├── copywriting.ts
    │   ├── segmentation.ts
    │   └── imageAnalysis.ts
    ├── sendTimeOptimization.ts
    └── trendDetection.ts
```

**Dittofeed Extension Point:** New package that hooks into various parts of the platform

---

### 7. **Fashion-Specific Segmentation**
**Priority**: High | **Phase**: 2

**Pre-Built Segment Templates:**

- **By Purchase Behavior:**
  - First-time buyers
  - Repeat customers (2+, 5+, 10+ purchases)
  - High-value customers (>$X lifetime value)
  - Recent purchasers (last 7/30/90 days)
  - Lapsed customers (no purchase in 60/90 days)

- **By Product Preferences:**
  - Category affinity (dresses, shoes, accessories)
  - Price sensitivity (budget, mid-range, luxury)
  - Brand preference
  - Color preferences
  - Size preferences

- **By Engagement:**
  - Email engaged (opened last 3 emails)
  - Click-active (clicked in last 30 days)
  - Inactive (no engagement in 30/60 days)
  - Cart abandoners (last 7 days)

- **By Demographics:**
  - Gender preference
  - Location-based

**Technical Approach:**
- Extend Dittofeed's segment operators
- Add fashion-specific computed properties

**Dittofeed Extension Point:** `packages/backend-lib/src/segments/` + `computedProperties/`

---

## **Revised Architecture**

```
mapp-fashion/
├── packages/
│   ├── mapp-dashboard/          # Restyled UI (forked from dashboard)
│   ├── mapp-branding/           # White-label theme engine
│   ├── mapp-onboarding/         # Custom onboarding
│   ├── product-catalog/         # Product feed management
│   ├── recommendation-engine/   # Recommendation strategies
│   ├── mapp-templates/          # Pre-built automations
│   ├── mapp-ai/                 # AI features
│   └── analytics-dashboard/     # Fashion-specific analytics
│
├── services/
│   ├── kafka-consumer/          # Ingest client events
│   ├── product-sync-worker/     # Product feed sync
│   └── recommendation-service/  # Recommendation generation
│
├── integrations/
│   ├── shopify/                 # Shopify integration
│   ├── woocommerce/            # WooCommerce integration
│   └── product-feeds/          # Generic feed parser
│
└── dittofeed/                   # Base Dittofeed (git submodule)
```

---

## **Revised MVP Roadmap**

### **Phase 1: Foundation (Weeks 1-3)**
- [ ] Kafka consumer service for event ingestion
- [ ] Product feed import system (CSV + Shopify)
- [ ] Basic product catalog UI
- [ ] Test end-to-end: Kafka event → Dittofeed → Email

### **Phase 2: Core Features (Weeks 4-6)**
- [ ] Product recommendation engine (collaborative + content-based)
- [ ] Template variables for product injection in emails
- [ ] Pre-built journey templates (3-4 key automations)
- [ ] Abandoned cart automation (fully configured)
- [ ] Post-purchase automation (fully configured)

### **Phase 3: UI & Templates (Weeks 7-8)**
- [ ] Dashboard rebranding/restyling
- [ ] Automation library UI
- [ ] Email template library (5-10 templates)
- [ ] White-label configuration system
- [ ] Onboarding flow for new clients

### **Phase 4: AI Features (Weeks 9-10)**
- [ ] AI subject line generation
- [ ] AI product tagging/categorization
- [ ] Smart segmentation builder
- [ ] Trend detection (basic)

### **Phase 5: Advanced Automations (Weeks 11-12)**
- [ ] Back-in-stock alerts
- [ ] Price drop alerts
- [ ] New arrivals digest
- [ ] Win-back campaigns
- [ ] VIP/Loyalty automations
- [ ] Fashion-specific analytics dashboard

---

## **Key Technical Decisions**

### **1. Kafka Integration Architecture**
```typescript
// Kafka consumer maps events to Dittofeed format
{
  kafka_event: "product_view",
  client_id: "fashion_shop_123",
  user_id: "user_456",
  timestamp: "2025-10-23T10:00:00Z",
  properties: {
    product_id: "SKU123",
    product_name: "Blue Denim Jacket",
    price: 89.99,
    category: "outerwear",
    image_url: "..."
  }
}

// Maps to Dittofeed event:
{
  event: "product_viewed",
  userId: "user_456",
  properties: {...}
}
```

### **2. Recommendation Strategy Priority**
1. **Start Simple**: Collaborative filtering (purchase co-occurrence)
2. **Add Personalization**: Content-based (category, price, brand matching)
3. **Enhance with AI**: Embeddings for semantic similarity (Phase 4)

### **3. Template Variable System**
```liquid
{{ recommended_products }}         // Personalized recommendations
{{ cart_products }}                // Cart items
{{ similar_products }}             // Similar to viewed/purchased
{{ trending_products }}            // Platform-wide trending
{{ new_arrivals }}                 // Recent additions to catalog
{{ back_in_stock_products }}       // For specific user
```

---

## **Next Steps - Information Needed**

1. **Kafka Stream Format**: Sample event from your Kafka stream

2. **Product Feed**: Sample product feed (CSV/JSON)

3. **Priority Features**: Which 3 automations to build first?
   - Abandoned cart?
   - Post-purchase?
   - New arrivals?
   - Back-in-stock?
   - Browse abandonment?

4. **UI/Branding**: Design mockups or style guide for Mapp Fashion brand

5. **Client Onboarding**: How do clients typically onboard?
   - Self-service?
   - Assisted setup?
   - What data do they provide upfront?

---

## **Success Metrics**

### **Technical**
- Kafka event processing latency < 100ms
- Recommendation generation time < 200ms
- Email delivery rate > 98%
- System uptime > 99.5%

### **Business**
- Client onboarding time < 2 hours
- Time to first campaign < 1 day
- Abandoned cart recovery rate improvement: +25%
- Email open rates: +15% vs industry average
- Click-through rates: +30% vs industry average

---

**Last Updated**: 2025-10-23
**Status**: Revised Planning Phase
**Next Review**: After Phase 1 completion
