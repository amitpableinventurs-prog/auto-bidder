import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding rich data...');

  const carData = [
    { brand: 'Maruti Suzuki', model: 'Swift', variant: 'VXi AMT', year: 2022, fuel: 'Petrol', transmission: 'Automatic', color: 'Pearl Red', city: 'Mumbai', km: 18000, demand: 750000, plate: 'MH01AB1234', ownership: '1st Owner', status: 'ACTIVE' as const, carType: 'Hatchback' },
    { brand: 'Hyundai', model: 'Creta', variant: 'SX(O)', year: 2023, fuel: 'Petrol', transmission: 'Automatic', color: 'Typhoon Silver', city: 'Bangalore', km: 9500, demand: 1450000, plate: 'KA01BB5678', ownership: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
    { brand: 'Tata Motors', model: 'Nexon EV', variant: 'Max XZ+', year: 2023, fuel: 'Electric', transmission: 'Automatic', color: 'Pristine White', city: 'Pune', km: 22000, demand: 1680000, plate: 'MH12CC9012', ownership: '1st Owner', status: 'PENDING_INSPECTION' as const, carType: 'SUV Cars' },
    { brand: 'Honda', model: 'City', variant: 'ZX CVT', year: 2021, fuel: 'Petrol', transmission: 'Automatic', color: 'Platinum White', city: 'Delhi', km: 34000, demand: 1150000, plate: 'DL7CX3456', ownership: '2nd Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
    { brand: 'Kia', model: 'Seltos', variant: 'HTX+', year: 2022, fuel: 'Diesel', transmission: 'Manual', color: 'Glacier White', city: 'Hyderabad', km: 28000, demand: 1320000, plate: 'TS09DD7890', ownership: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
    { brand: 'Mahindra', model: 'Thar', variant: 'LX Hard Top', year: 2023, fuel: 'Diesel', transmission: 'Automatic', color: 'Everest White', city: 'Indore', km: 12000, demand: 1850000, plate: 'MP09EE2345', ownership: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
    { brand: 'Toyota', model: 'Innova Crysta', variant: '2.4 VX MT', year: 2020, fuel: 'Diesel', transmission: 'Manual', color: 'Silver Metallic', city: 'Chennai', km: 65000, demand: 2100000, plate: 'TN22FF6789', ownership: '1st Owner', status: 'PENDING_INSPECTION' as const, carType: 'SUV Cars' },
    { brand: 'MG Motors', model: 'Hector', variant: 'Sharp Pro', year: 2022, fuel: 'Petrol', transmission: 'Automatic', color: 'Candy White', city: 'Ahmedabad', km: 31000, demand: 1580000, plate: 'GJ01GG1234', ownership: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
    { brand: 'Volkswagen', model: 'Virtus', variant: 'GT Plus', year: 2023, fuel: 'Petrol', transmission: 'Automatic', color: 'Wild Cherry Red', city: 'Mumbai', km: 5000, demand: 1750000, plate: 'MH01HH1234', ownership: '1st Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
    { brand: 'Skoda', model: 'Slavia', variant: '1.5 TSI Style', year: 2022, fuel: 'Petrol', transmission: 'Manual', color: 'Crystal Blue', city: 'Delhi', km: 15000, demand: 1600000, plate: 'DL8JJ5678', ownership: '1st Owner', status: 'SOLD' as const, carType: 'Sedan' },
  ];

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'seller1@autobidder.demo' }, create: { email: 'seller1@autobidder.demo', phone: '9999900001', name: 'Rajesh Kumar' }, update: {} }),
    prisma.user.upsert({ where: { email: 'seller2@autobidder.demo' }, create: { email: 'seller2@autobidder.demo', phone: '9999900002', name: 'Priya Sharma' }, update: {} }),
    prisma.user.upsert({ where: { email: 'buyer1@autobidder.demo' }, create: { email: 'buyer1@autobidder.demo', phone: '9999900003', name: 'Amit Patel' }, update: {} }),
    prisma.user.upsert({ where: { email: 'buyer2@autobidder.demo' }, create: { email: 'buyer2@autobidder.demo', phone: '9999900004', name: 'Sneha Verma' }, update: {} }),
  ]);

  const [seller1, seller2, buyer1, buyer2] = users;

  console.log('Creating listings...');
  for (let i = 0; i < carData.length; i++) {
    const car = carData[i];
    const listing = await prisma.listing.create({
      data: {
        sellerId: i % 2 === 0 ? seller1.id : seller2.id,
        title: `${car.brand} ${car.model} ${car.variant}`,
        brand: car.brand, model: car.model, variant: car.variant,
        manufacturingYear: car.year, fuelType: car.fuel, transmission: car.transmission,
        carType: car.carType,
        color: car.color, city: car.city, plateNumber: car.plate,
        ownership: car.ownership, kilometersDriven: car.km,
        demandPrice: car.demand, startingBid: Math.floor(car.demand * 0.9),
        status: car.status,
        imageUrl: `https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=60&sig=${i}`,
      },
    });

    if (listing.status === 'ACTIVE') {
        await prisma.bid.create({
            data: {
                listingId: listing.id,
                userId: i % 2 === 0 ? buyer2.id : buyer1.id,
                amount: listing.startingBid + 10000,
            }
        });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
