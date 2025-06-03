import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create knowledge directory if it doesn't exist
const knowledgeDir = path.join(dirname(__dirname), 'knowledge');

if (!fs.existsSync(knowledgeDir)) {
  console.log('Creating knowledge directory...');
  fs.mkdirSync(knowledgeDir, { recursive: true });
}

// Sample knowledge content if files don't exist
const sampleKnowledge: Record<string, string> = {
  'products.txt': `
# Cake A Day Product Information

## Cakes
- Chocolate Cake: Rich chocolate cake with chocolate ganache. Available in various sizes. Price: R250-R500
- Vanilla Cake: Light and fluffy vanilla cake with buttercream frosting. Available in various sizes. Price: R220-R450
- Red Velvet Cake: Classic red velvet with cream cheese frosting. Available in various sizes. Price: R280-R550
- Carrot Cake: Moist carrot cake with cream cheese frosting and walnut pieces. Price: R260-R520
- Gold & Black Cake: Elegant gold and black number cake for milestone birthdays with luxurious decorations. Custom pricing.
- Custom Number Cake: Shaped cake in any number you need for birthdays or anniversaries. Custom pricing.

## Cupcakes
- Vanilla Cupcakes: Classic vanilla cupcakes with buttercream frosting. Price: R25 each
- Chocolate Cupcakes: Rich chocolate cupcakes with chocolate frosting. Price: R25 each
- Red Velvet Cupcakes: Red velvet cupcakes with cream cheese frosting. Price: R30 each
- Burger Muffins: Kiddie burger muffins for those special days to enjoy with friends and family. Price: R90.00
- Black & Gold Cupcakes: Elegant black cupcakes with gold star decorations. Price: R35 each

## Other Products
- Baklava pieces: Combines layers of honey-soaked crisp phyllo pastry and a cinnamon-scented nut filling. Price: R360.00
- Waffles: These waffles are crisp, golden, light, and fluffy. Perfect for a delicious breakfast. Price: R40.00
- Tarts: Various fruit and custard tarts. Price: R35-R45 each
- Pies: Selection of sweet and savory pies. Price: R180-R220
- Loaves: Banana bread, lemon loaf, and other tea loaves. Price: R120-R150
`,

  'services.txt': `
# Cake A Day Services

## Custom Orders
- Custom Cake Design: Work with our designers to create your dream cake for any occasion
- Corporate Orders: Special pricing and delivery for large corporate events
- Wedding Cakes: Consultation and tasting sessions available for wedding cake selection

## Delivery Information
- Local Delivery: Available within 20km radius of our store for R50
- Same-day Delivery: Order before 10am for same-day delivery (subject to availability)
- Collection: Free collection from our store during business hours

## Store Information
- Opening Hours: Monday-Friday 8am-6pm, Saturday 8am-4pm, Sunday 9am-2pm
- Location: 123 Cake Street, Bakery District
- Contact: 555-CAKE-DAY or info@cakeaday.com
`,

  'faq.txt': `
# Cake A Day Frequently Asked Questions

## Ordering
- How far in advance should I order a custom cake? We recommend at least 3-5 days for standard cakes and 2 weeks for wedding or elaborate custom designs.
- Do you cater for dietary restrictions? Yes, we offer vegan options and can accommodate most allergies with advance notice.
- What's your cancellation policy? Cancellations with 48 hours notice receive a full refund. Less than 48 hours may incur charges.

## Products
- Are your products made fresh daily? Yes, all our products are baked fresh daily using premium ingredients.
- Do you use artificial flavors? No, we use natural ingredients and flavors in all our products.
- How long do your cakes stay fresh? Our cakes are best enjoyed within 3 days of purchase. Store in a cool place or refrigerate.
- Do you offer waffles? Yes, we offer delicious crisp, golden waffles that are light and fluffy, perfect for breakfast. They cost R40.00 per serving.

## Payment and Delivery
- What payment methods do you accept? We accept cash, credit/debit cards, and EFT payments.
- Do you deliver? Yes, we offer delivery within a 20km radius for a fee of R50.
- Can I collect my order? Yes, you can collect your order from our store during business hours.
`,

  'price-list.txt': `
# Cake A Day Price List

## Cakes
- Chocolate Cake: R250-R500 (depending on size)
- Vanilla Cake: R220-R450 (depending on size)
- Red Velvet Cake: R280-R550 (depending on size)
- Carrot Cake: R260-R520 (depending on size)
- Gold & Black Cake: Custom pricing
- Custom Number Cake: Custom pricing

## Cupcakes
- Vanilla Cupcakes: R25 each
- Chocolate Cupcakes: R25 each
- Red Velvet Cupcakes: R30 each
- Burger Muffins: R90.00
- Black & Gold Cupcakes: R35 each

## Other Products
- Baklava pieces: R360.00
- Waffles: R40.00
- Tarts: R35-R45 each
- Pies: R180-R220
- Loaves: R120-R150

## Services
- Local Delivery: R50 (within 20km radius)
- Same-day Delivery: Available for orders placed before 10am (subject to availability)
- Collection: Free from our store during business hours`,

};

// Create sample knowledge files if they don't exist
Object.entries(sampleKnowledge).forEach(([filename, content]) => {
  const filePath = path.join(knowledgeDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Creating sample knowledge file: ${filename}`);
    fs.writeFileSync(filePath, content.trim());
  } else {
    console.log(`File already exists: ${filename}`);
  }
});

console.log('Knowledge setup complete!');