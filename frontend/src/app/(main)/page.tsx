import { Container } from '@/components/ui/Container';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategorySidebar } from '@/components/home/CategorySidebar';
import { FlashSale } from '@/components/home/FlashSale';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';

export default function HomePage() {
  return (
    <Container className="py-5">
      <HeroBanner />

      <div className="mt-6 flex gap-5">
        <CategorySidebar />
        <div className="min-w-0 flex-1">
          <FlashSale />
          <FeaturedProducts />
        </div>
      </div>
    </Container>
  );
}
