export type ListingStatus = 'DRAFT' | 'PENDING_INSPECTION' | 'ACTIVE' | 'SOLD' | 'REJECTED';
export type BidStatus = 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'SUPERSEDED';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type AppointmentType = 'BUYER_INSPECTION' | 'AUTOBIDDER_INSPECTION' | 'AUTHORIZED_CENTER';
export type NocStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'REQUIRES_ACTION' | 'FAILED' | 'CANCELLED';
export type NotificationType = 'OUTBID' | 'BID_ACCEPTED' | 'BID_REJECTED' | 'PAYMENT_CONFIRMED' | 'APPOINTMENT_CONFIRMED' | 'APPOINTMENT_CANCELLED' | 'AUTO_BID_TRIGGERED' | 'LISTING_SOLD' | 'SYSTEM';

export type Slider = {
  id: string;
  type: 'ONBOARDING' | 'HOME' | 'BUY_CAR' | 'SELL_CAR';
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  link?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Brand = {
  id: string;
  name: string;
  logo: string;
  count: string;
  description?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type User = {
  id: string;
  email: string;
  phone?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  address?: string | null;
  city?: string | null;
  zipCode?: string | null;
  userType?: string | null;
  businessName?: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  isVerified: boolean;
  isFeatured: boolean;
  isDistributor?: boolean;
  distributorCode?: string | null;
  distributorStatus?: 'ACTIVE' | 'SUSPENDED' | null;
  referralEarnings?: number;
  referredByDistributorCode?: string | null;
  referredByUserId?: string | null;
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | null;
  kycImageUrl?: string | null;
  createdAt: Date;
};

type Listing = {
  id: string;
  title: string;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  variant?: string | null;
  manufacturingYear?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  carType?: string | null;
  color?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  plateNumber?: string | null;
  ownership?: string | null;
  kilometersDriven?: number | null;
  condition?: string | null;
  demandPrice?: number | null;
  startingBid: number;
  imageUrl?: string | null;
  images?: string[] | null;
  rcImages?: string[] | null;
  invoiceImages?: string[] | null;
  bankNocImages?: string[] | null;
  status: ListingStatus;
  sellerId: string;
  insuranceType?: string | null;
  insuranceExpiry?: string | null;
  registrationDate?: string | null;
  rcOwnerName?: string | null;
  rcOwnerNumber?: string | null;
  rcAvailability?: string | null;
  originalInvoice?: boolean | null;
  bankHypothecation?: boolean | null;
  loanStatus?: string | null;
  rtoTaxStatus?: string | null;
  rtoNocIssued?: string | null;
  rtoNocNumber?: string | null;
  rtoNocFor?: string | null;
  ownershipType?: string | null;
  cngLpgStatus?: string | null;
  duplicateKeys?: boolean | null;
  serviceBookAvailability?: boolean | null;
  remainingFreeService?: number | null;
  remainingOemWarranty?: string | null;
  listedBy?: string | null;
  accidentalHistory?: string | null;
  inspectionReportUrl?: string | null;
  inspectionReportStatus?: string | null;
  referredByDistributorCode?: string | null;
  referredByUserId?: string | null;
  referralCapturedAt?: Date | null;
  referralAttributionExpiresAt?: Date | null;
  distributorCommissionAmount?: number | null;
  distributorCommissionStatus?: 'NONE' | 'PENDING' | 'PAID' | 'REJECTED' | null;
  createdAt: Date;
  updatedAt: Date;
};

type Bid = {
  id: string;
  listingId: string;
  userId: string;
  amount: number;
  status: BidStatus;
  autoBidConfigId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Appointment = {
  id: string;
  listingId: string;
  userId: string;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt?: Date | null;
  location?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type RtoNoc = {
  id: string;
  listingId: string;
  rtoTaxStatus?: string | null;
  rtoDues?: string | null;
  rtoNocIssued?: string | null;
  bankNocStatus: NocStatus;
  rtoNocStatus: NocStatus;
  invoiceStatus: NocStatus;
  ownerIdStatus: NocStatus;
  uploadedCount: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string | null;
  stripeClientSecret?: string | null;
  metadata?: any;
  bidId?: string | null;
  listingId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AutoBidConfig = {
  id: string;
  maxLimit: number;
  increment: number;
  isActive: boolean;
  userId: string;
  listingId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  userId: string;
  createdAt: Date;
};

type PushToken = {
  id: string;
  token: string;
  platform: string;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type FraudAlert = {
  id: string;
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  userId?: string | null;
  userName?: string | null;
  createdAt: Date;
};

type AuditLog = {
  id: string;
  action: string;
  adminName: string;
  target: string;
  details: any;
  timestamp: Date;
};

let sequence = 0;
const id = (prefix: string) => {
  sequence += 1;
  return `${prefix}_${Date.now().toString(36)}_${sequence.toString(36)}`;
};

function phoneEmail(phone: string) {
  return `${phone.replaceAll(/\D/g, '')}@phone.autobidder.local`;
}

function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    avatarUrl: user.avatarUrl,
    address: user.address,
    city: user.city,
    zipCode: user.zipCode,
    userType: user.userType,
    businessName: user.businessName,
    role: user.role,
    isVerified: user.isVerified,
    isFeatured: user.isFeatured,
    isDistributor: user.isDistributor ?? false,
    distributorCode: user.distributorCode ?? null,
    distributorStatus: user.distributorStatus ?? 'ACTIVE',
    referralEarnings: user.referralEarnings ?? 0,
    kycStatus: user.kycStatus
  };
}

class DevStore {
  private readonly users: User[] = [];
  private readonly listings: Listing[] = [];
  private readonly bids: Bid[] = [];
  private readonly appointments: Appointment[] = [];
  private readonly rtoNocs: RtoNoc[] = [];
  private readonly payments: Payment[] = [];
  private readonly autoBidConfigs: AutoBidConfig[] = [];
  private readonly notifications: Notification[] = [];
  private readonly pushTokens: PushToken[] = [];
  private readonly fraudAlerts: FraudAlert[] = [];
  private readonly auditLogs: AuditLog[] = [];
  private readonly favorites: { userId: string; listingId: string; createdAt: Date }[] = [];
  private readonly sliders: Slider[] = [];
  private readonly brands: Brand[] = [];
  private readonly leads: { id: string; name: string; email: string; phone: string; listingId: string; createdAt: Date }[] = [];
  private readonly payouts: { id: string; userId: string; amount: number; status: 'PENDING' | 'PROCESSED'; createdAt: Date }[] = [];

  // User methods
  upsertPhoneUser(phone: string, name = 'Mobile User', referralCode?: string) {
    const existing = this.users.find((user) => user.phone === phone);
    if (existing) {
      existing.name = name;
      return publicUser(existing);
    }

    const distributor = referralCode ? this.getDistributorByCode(referralCode) : null;

    const user: User = {
      id: id('usr'),
      email: phoneEmail(phone),
      phone,
      name,
      role: 'BUYER',
      isVerified: false,
      isFeatured: false,
      isDistributor: false,
      distributorCode: null,
      distributorStatus: 'ACTIVE',
      referralEarnings: 0,
      referredByDistributorCode: distributor?.distributorCode ?? referralCode ?? null,
      referredByUserId: distributor?.id ?? null,
      createdAt: new Date(),
    };
    this.users.push(user);
    return publicUser(user);
  }

  upsertEmailUser(email: string, name?: string) {
    const existing = this.users.find((user) => user.email === email);
    if (existing) {
      existing.name = name ?? existing.name;
      return publicUser(existing);
    }

    const user: User = {
      id: id('usr'),
      email,
      name: name ?? null,
      role: 'BUYER',
      isVerified: false,
      isFeatured: false,
      isDistributor: false,
      distributorCode: null,
      distributorStatus: 'ACTIVE',
      referralEarnings: 0,
      createdAt: new Date(),
    };
    this.users.push(user);
    return publicUser(user);
  }

  updateUser(userId: string, patch: Partial<User>) {
    const user = this.mustUser(userId);
    Object.assign(user, patch);
    return publicUser(user);
  }

  getUser(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    return user ? publicUser(user) : null;
  }

  // Listing methods
  listListings(query: { status?: ListingStatus; city?: string; q?: string; sellerId?: string, brand?: string, fuelType?: string, transmission?: string, carType?: string, minPrice?: number, maxPrice?: number }) {
    const needle = query.q?.trim().toLowerCase();
    return this.listings
      .filter((listing) => {
        const matchesStatus = !query.status || listing.status === query.status;
        const matchesCity = !query.city || listing.city === query.city;
        const matchesSeller = !query.sellerId || listing.sellerId === query.sellerId;
        const matchesBrand = !query.brand || listing.brand?.toLowerCase().includes(query.brand.toLowerCase());
        const matchesFuel = !query.fuelType || listing.fuelType === query.fuelType;
        const matchesTrans = !query.transmission || listing.transmission === query.transmission;
        const matchesCarType = !query.carType || listing.carType === query.carType;
        const matchesMinPrice = !query.minPrice || (listing.demandPrice ?? 0) >= query.minPrice;
        const matchesMaxPrice = !query.maxPrice || (listing.demandPrice ?? 0) <= query.maxPrice;
        const matchesText =
          !needle ||
          [listing.title, listing.brand, listing.model, listing.city, listing.plateNumber]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(needle));
        return matchesStatus && matchesCity && matchesSeller && matchesBrand && matchesFuel && matchesTrans && matchesCarType && matchesMinPrice && matchesMaxPrice && matchesText;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((listing) => this.hydrateListing(listing));
  }

  getListing(listingId: string) {
    const listing = this.listings.find((item) => item.id === listingId);
    if (!listing) return null;
    return {
      ...this.hydrateListing(listing),
      bids: this.bidsForListing(listingId).map((bid) => ({
        ...bid,
        user: publicUser(this.mustUser(bid.userId)),
      })),
      appointments: this.appointments
        .filter((appointment) => appointment.listingId === listingId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((appointment) => ({
          ...appointment,
          user: publicUser(this.mustUser(appointment.userId)),
        })),
    };
  }

  createListing(input: Omit<Partial<Listing>, 'id' | 'createdAt' | 'updatedAt'> & { sellerId: string; title: string }) {
    this.mustUser(input.sellerId);
    const now = new Date();
    const listing: Listing = {
      id: id('lst'),
      title: input.title,
      description: input.description ?? null,
      brand: input.brand ?? null,
      model: input.model ?? null,
      variant: input.variant ?? null,
      manufacturingYear: input.manufacturingYear ?? null,
      fuelType: input.fuelType ?? null,
      transmission: input.transmission ?? null,
      carType: input.carType ?? null,
      color: input.color ?? null,
      city: input.city ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      plateNumber: input.plateNumber ?? null,
      ownership: input.ownership ?? null,
      kilometersDriven: input.kilometersDriven ?? null,
      condition: input.condition ?? null,
      demandPrice: input.demandPrice ?? null,
      startingBid: input.startingBid ?? Math.max(Math.floor((input.demandPrice ?? 0) * 0.9), 0),
      imageUrl: input.imageUrl ?? null,
      images: input.images ?? null,
      rcImages: input.rcImages ?? null,
      invoiceImages: input.invoiceImages ?? null,
      bankNocImages: input.bankNocImages ?? null,
      insuranceType: input.insuranceType ?? null,
      insuranceExpiry: input.insuranceExpiry ?? null,
      registrationDate: input.registrationDate ?? null,
      rcOwnerName: input.rcOwnerName ?? null,
      rcOwnerNumber: input.rcOwnerNumber ?? null,
      rcAvailability: input.rcAvailability ?? null,
      originalInvoice: input.originalInvoice ?? null,
      bankHypothecation: input.bankHypothecation ?? null,
      loanStatus: input.loanStatus ?? null,
      rtoTaxStatus: input.rtoTaxStatus ?? null,
      rtoNocIssued: input.rtoNocIssued ?? null,
      rtoNocNumber: input.rtoNocNumber ?? null,
      rtoNocFor: input.rtoNocFor ?? null,
      ownershipType: input.ownershipType ?? null,
      cngLpgStatus: input.cngLpgStatus ?? null,
      duplicateKeys: input.duplicateKeys ?? null,
      serviceBookAvailability: input.serviceBookAvailability ?? null,
      remainingFreeService: input.remainingFreeService ?? null,
      remainingOemWarranty: input.remainingOemWarranty ?? null,
      listedBy: input.listedBy ?? null,
      accidentalHistory: input.accidentalHistory ?? null,
      inspectionReportUrl: input.inspectionReportUrl ?? null,
      inspectionReportStatus: input.inspectionReportStatus ?? 'PENDING',
      referredByDistributorCode: input.referredByDistributorCode ?? null,
      referredByUserId: input.referredByUserId ?? null,
      referralCapturedAt: input.referralCapturedAt ?? (input.referredByDistributorCode ? now : null),
      referralAttributionExpiresAt: input.referralAttributionExpiresAt ?? (input.referredByDistributorCode ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : null),
      distributorCommissionAmount: input.distributorCommissionAmount ?? 0,
      distributorCommissionStatus: input.distributorCommissionStatus ?? (input.referredByDistributorCode ? 'PENDING' : 'NONE'),
      status: input.status ?? 'PENDING_INSPECTION',
      sellerId: input.sellerId,
      createdAt: now,
      updatedAt: now,
    };
    this.listings.push(listing);
    return this.hydrateListing(listing);
  }

  updateListing(listingId: string, patch: Partial<Listing>) {
    const listing = this.mustListing(listingId);
    const previousStatus = listing.status;
    Object.assign(listing, patch, { updatedAt: new Date() });
    if (listing.referredByUserId && previousStatus !== listing.status) {
      this.refreshDistributorCommission(listing.id);
    }
    return this.hydrateListing(listing);
  }

  deleteListing(listingId: string) {
    const index = this.listings.findIndex((item) => item.id === listingId);
    if (index === -1) throw new Error('Listing not found');
    this.listings.splice(index, 1);
    // Also cleanup related data
    for (let i = this.bids.length - 1; i >= 0; i--) {
      if (this.bids[i].listingId === listingId) this.bids.splice(i, 1);
    }
    for (let i = this.appointments.length - 1; i >= 0; i--) {
      if (this.appointments[i].listingId === listingId) this.appointments.splice(i, 1);
    }
    for (let i = this.rtoNocs.length - 1; i >= 0; i--) {
      if (this.rtoNocs[i].listingId === listingId) this.rtoNocs.splice(i, 1);
    }
    return true;
  }

  // Bid methods
  createBid(listingId: string, userId: string, amount: number, autoBidConfigId?: string) {
    const listing = this.mustListing(listingId);
    this.mustUser(userId);
    const highest = this.bidsForListing(listingId)[0]?.amount ?? listing.startingBid;
    if (amount <= highest) {
      throw new Error(`Bid must be > ${highest}`);
    }

    const now = new Date();
    const bid: Bid = {
      id: id('bid'),
      listingId,
      userId,
      amount,
      status: 'SUBMITTED',
      autoBidConfigId: autoBidConfigId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.bids.push(bid);
    
    // Trigger auto-bids
    this.processAutoBids(listingId);
    
    return { ...bid, user: publicUser(this.mustUser(userId)) };
  }

  listBids(userId?: string) {
    return this.bids
      .filter((bid) => !userId || bid.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((bid) => ({
        ...bid,
        listing: this.mustListing(bid.listingId),
        user: publicUser(this.mustUser(bid.userId)),
      }));
  }

  updateBidStatus(bidId: string, status: BidStatus) {
    const bid = this.bids.find((item) => item.id === bidId);
    if (!bid) throw new Error('Bid not found');
    bid.status = status;
    bid.updatedAt = new Date();
    return {
      ...bid,
      listing: this.mustListing(bid.listingId),
      user: publicUser(this.mustUser(bid.userId)),
    };
  }

  // Auto-bid methods
  createAutoBidConfig(userId: string, listingId: string, maxLimit: number, increment: number = 5000) {
    this.mustUser(userId);
    this.mustListing(listingId);
    
    const existing = this.autoBidConfigs.find(
      (config) => config.userId === userId && config.listingId === listingId
    );
    
    if (existing) {
      existing.maxLimit = maxLimit;
      existing.increment = increment;
      existing.isActive = true;
      existing.updatedAt = new Date();
      return existing;
    }

    const now = new Date();
    const config: AutoBidConfig = {
      id: id('abc'),
      maxLimit,
      increment,
      isActive: true,
      userId,
      listingId,
      createdAt: now,
      updatedAt: now,
    };
    this.autoBidConfigs.push(config);
    return config;
  }

  deleteAutoBidConfig(configId: string) {
    const config = this.autoBidConfigs.find((item) => item.id === configId);
    if (!config) throw new Error('Auto-bid config not found');
    config.isActive = false;
    config.updatedAt = new Date();
    return config;
  }

  processAutoBids(listingId: string) {
    const listing = this.mustListing(listingId);
    const currentHighest = this.bidsForListing(listingId)[0];
    if (!currentHighest) return;

    const activeAutoBids = this.autoBidConfigs.filter(
      (config) => config.listingId === listingId && config.isActive && config.userId !== currentHighest.userId
    );

    for (const config of activeAutoBids) {
      const newAmount = currentHighest.amount + config.increment;
      if (newAmount <= config.maxLimit) {
        this.createBid(listingId, config.userId, newAmount, config.id);
        this.createNotification(
          config.userId,
          'AUTO_BID_TRIGGERED',
          'Auto-bid Triggered',
          `Your auto-bid placed ₹${newAmount.toLocaleString('en-IN')} on ${listing.title}`
        );
      } else {
        config.isActive = false;
        config.updatedAt = new Date();
        this.createNotification(
          config.userId,
          'OUTBID',
          'Outbid - Auto-bid Limit Reached',
          `Your auto-bid limit reached on ${listing.title}`
        );
      }
    }
  }

  getAutoBidConfigs(userId?: string) {
    return this.autoBidConfigs
      .filter((config) => !userId || config.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Payment methods
  createPayment(input: {
    amount: number;
    currency?: string;
    bidId?: string;
    listingId?: string;
    stripePaymentIntentId?: string;
    stripeClientSecret?: string;
  }) {
    const now = new Date();
    const payment: Payment = {
      id: id('pay'),
      amount: input.amount,
      currency: input.currency ?? 'INR',
      status: 'PENDING',
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      stripeClientSecret: input.stripeClientSecret ?? null,
      metadata: null,
      bidId: input.bidId ?? null,
      listingId: input.listingId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.payments.push(payment);
    return payment;
  }

  updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    const payment = this.payments.find((item) => item.id === paymentId);
    if (!payment) throw new Error('Payment not found');
    payment.status = status;
    payment.updatedAt = new Date();
    return payment;
  }

  listPayments(query: { userId?: string; status?: PaymentStatus; listingId?: string }) {
    return this.payments
      .filter((payment) => {
        const matchesUser = !query.userId || (() => {
          const bid = this.bids.find((b) => b.id === payment.bidId);
          return bid?.userId === query.userId;
        })();
        const matchesStatus = !query.status || payment.status === query.status;
        const matchesListing = !query.listingId || payment.listingId === query.listingId;
        return matchesUser && matchesStatus && matchesListing;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Notification methods
  createNotification(userId: string, type: NotificationType, title: string, message: string, data?: any) {
    const now = new Date();
    const notification: Notification = {
      id: id('not'),
      type,
      title,
      message,
      data: data ?? null,
      read: false,
      userId,
      createdAt: now,
    };
    this.notifications.push(notification);
    return notification;
  }

  listNotifications(userId: string, unreadOnly = false) {
    return this.notifications
      .filter((notif) => notif.userId === userId && (!unreadOnly || !notif.read))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  markNotificationRead(notificationId: string) {
    const notification = this.notifications.find((item) => item.id === notificationId);
    if (!notification) throw new Error('Notification not found');
    notification.read = true;
    return notification;
  }

  markAllNotificationsRead(userId: string) {
    this.notifications
      .filter((notif) => notif.userId === userId && !notif.read)
      .forEach((notif) => { notif.read = true; });
    return { count: this.notifications.filter((n) => n.userId === userId && !n.read).length };
  }

  getUnreadCount(userId: string) {
    return this.notifications.filter((notif) => notif.userId === userId && !notif.read).length;
  }

  // Brand methods
  listBrands(query: { isActive?: boolean } = {}) {
    return this.brands
      .filter((b) => query.isActive === undefined || b.isActive === query.isActive)
      .sort((a, b) => a.order - b.order || b.createdAt.getTime() - a.createdAt.getTime());
  }

  createBrand(input: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const brand: Brand = {
      id: id('brd'),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.brands.push(brand);
    return brand;
  }

  updateBrand(id: string, patch: Partial<Brand>) {
    const brand = this.brands.find(b => b.id === id);
    if (!brand) throw new Error('Brand not found');
    Object.assign(brand, patch, { updatedAt: new Date() });
    return brand;
  }

  deleteBrand(id: string) {
    const index = this.brands.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Brand not found');
    this.brands.splice(index, 1);
    return true;
  }

  getBrands() {
    const brands = this.listBrands({ isActive: true });
    if (brands.length > 0) return brands;

    const LOGO_BASE_URL = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized';
    return [
      { id: 'maruti', name: 'Maruti Suzuki', logo: `${LOGO_BASE_URL}/suzuki.png`, count: '2.5k+ Cars' },
      { id: 'hyundai', name: 'Hyundai', logo: `${LOGO_BASE_URL}/hyundai.png`, count: '1.8k+ Cars' },
      { id: 'tata', name: 'Tata Motors', logo: `${LOGO_BASE_URL}/tata.png`, count: '1.2k+ Cars' },
      { id: 'mahindra', name: 'Mahindra', logo: `${LOGO_BASE_URL}/mahindra.png`, count: '950+ Cars' },
      { id: 'kia', name: 'Kia', logo: `${LOGO_BASE_URL}/kia.png`, count: '600+ Cars' },
      { id: 'honda', name: 'Honda', logo: `${LOGO_BASE_URL}/honda.png`, count: '850+ Cars' },
      { id: 'toyota', name: 'Toyota', logo: `${LOGO_BASE_URL}/toyota.png`, count: '700+ Cars' },
      { id: 'volkswagen', name: 'Volkswagen', logo: `${LOGO_BASE_URL}/volkswagen.png`, count: '450+ Cars' },
      { id: 'renault', name: 'Renault', logo: `${LOGO_BASE_URL}/renault.png`, count: '300+ Cars' },
      { id: 'ford', name: 'Ford', logo: `${LOGO_BASE_URL}/ford.png`, count: '250+ Cars' },
      { id: 'skoda', name: 'Skoda', logo: `${LOGO_BASE_URL}/skoda.png`, count: '200+ Cars' },
      { id: 'nissan', name: 'Nissan', logo: `${LOGO_BASE_URL}/nissan.png`, count: '150+ Cars' },
      { id: 'mg', name: 'MG Motors', logo: `${LOGO_BASE_URL}/mg.png`, count: '180+ Cars' },
      { id: 'jeep', name: 'Jeep', logo: `${LOGO_BASE_URL}/jeep.png`, count: '120+ Cars' },
      { id: 'citroen', name: 'Citroen', logo: `${LOGO_BASE_URL}/citroen.png`, count: '50+ Cars' },
      { id: 'fiat', name: 'Fiat', logo: `${LOGO_BASE_URL}/fiat.png`, count: '40+ Cars' },
      { id: 'isuzu', name: 'Isuzu', logo: `${LOGO_BASE_URL}/isuzu.png`, count: '30+ Cars' },
      { id: 'mitsubishi', name: 'Mitsubishi', logo: `${LOGO_BASE_URL}/mitsubishi.png`, count: '25+ Cars' },
      { id: 'force', name: 'Force Motors', logo: `${LOGO_BASE_URL}/force-motors.png`, count: '20+ Cars' },
      { id: 'datsun', name: 'Datsun', logo: `${LOGO_BASE_URL}/datsun.png`, count: '60+ Cars' },
      { id: 'bmw', name: 'BMW', logo: `${LOGO_BASE_URL}/bmw.png`, count: '150+ Cars' },
      { id: 'mercedes', name: 'Mercedes', logo: `${LOGO_BASE_URL}/mercedes-benz.png`, count: '140+ Cars' },
      { id: 'audi', name: 'Audi', logo: `${LOGO_BASE_URL}/audi.png`, count: '130+ Cars' },
      { id: 'jaguar', name: 'Jaguar', logo: `${LOGO_BASE_URL}/jaguar.png`, count: '45+ Cars' },
      { id: 'volvo', name: 'Volvo', logo: `${LOGO_BASE_URL}/volvo.png`, count: '40+ Cars' },
      { id: 'landrover', name: 'Land Rover', logo: `${LOGO_BASE_URL}/land-rover.png`, count: '35+ Cars' },
      { id: 'lexus', name: 'Lexus', logo: `${LOGO_BASE_URL}/lexus.png`, count: '20+ Cars' },
      { id: 'porsche', name: 'Porsche', logo: `${LOGO_BASE_URL}/porsche.png`, count: '25+ Cars' },
      { id: 'lamborghini', name: 'Lamborghini', logo: `${LOGO_BASE_URL}/lamborghini.png`, count: '10+ Cars' },
      { id: 'ferrari', name: 'Ferrari', logo: `${LOGO_BASE_URL}/ferrari.png`, count: '8+ Cars' },
      { id: 'maserati', name: 'Maserati', logo: `${LOGO_BASE_URL}/maserati.png`, count: '5+ Cars' },
      { id: 'bentley', name: 'Bentley', logo: `${LOGO_BASE_URL}/bentley.png`, count: '5+ Cars' },
      { id: 'rollsroyce', name: 'Rolls Royce', logo: `${LOGO_BASE_URL}/rolls-royce.png`, count: '3+ Cars' },
      { id: 'mini', name: 'Mini Cooper', logo: `${LOGO_BASE_URL}/mini.png`, count: '15+ Cars' },
    ];
  }

  // Favorite methods
  toggleFavorite(userId: string, listingId: string) {
    const index = this.favorites.findIndex(f => f.userId === userId && f.listingId === listingId);
    if (index !== -1) {
      this.favorites.splice(index, 1);
      return { isFavorite: false };
    }
    this.favorites.push({ userId, listingId, createdAt: new Date() });
    return { isFavorite: true };
  }

  listFavorites(userId: string) {
    const listingIds = this.favorites
      .filter(f => f.userId === userId)
      .map(f => f.listingId);
    return this.listings
      .filter(l => listingIds.includes(l.id))
      .map(l => this.hydrateListing(l));
  }

  isFavorite(userId: string, listingId: string) {
    return this.favorites.some(f => f.userId === userId && f.listingId === listingId);
  }

  // Push token methods
  registerPushToken(userId: string, token: string, platform = 'android') {
    const existing = this.pushTokens.find((pt) => pt.token === token);
    if (existing) {
      existing.userId = userId;
      existing.isActive = true;
      existing.updatedAt = new Date();
      return existing;
    }

    const now = new Date();
    const pushToken: PushToken = {
      id: id('ptk'),
      token,
      platform,
      isActive: true,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    this.pushTokens.push(pushToken);
    return pushToken;
  }

  getPushTokens(userId: string) {
    return this.pushTokens.filter((pt) => pt.userId === userId && pt.isActive);
  }

  // Appointment methods
  listAppointments(query: { userId?: string; listingId?: string; status?: AppointmentStatus }) {
    return this.appointments
      .filter((appointment) => {
        return (
          (!query.userId || appointment.userId === query.userId) &&
          (!query.listingId || appointment.listingId === query.listingId) &&
          (!query.status || appointment.status === query.status)
        );
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((appointment) => ({
        ...appointment,
        listing: this.mustListing(appointment.listingId),
        user: publicUser(this.mustUser(appointment.userId)),
      }));
  }

  createAppointment(input: {
    listingId: string;
    userId: string;
    type: AppointmentType;
    scheduledAt?: string;
    location?: string;
    notes?: string;
  }) {
    this.mustListing(input.listingId);
    this.mustUser(input.userId);
    const now = new Date();
    const appointment: Appointment = {
      id: id('apt'),
      listingId: input.listingId,
      userId: input.userId,
      type: input.type,
      status: 'PENDING',
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      location: input.location ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.appointments.push(appointment);
    this.updateListing(input.listingId, { status: 'PENDING_INSPECTION' });
    
    this.createNotification(
      input.userId,
      'APPOINTMENT_CONFIRMED',
      'Appointment Scheduled',
      `Your ${input.type.replace('_', ' ')} appointment has been scheduled`
    );
    
    return {
      ...appointment,
      listing: this.mustListing(appointment.listingId),
      user: publicUser(this.mustUser(appointment.userId)),
    };
  }

  updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
    const appointment = this.appointments.find((item) => item.id === appointmentId);
    if (!appointment) throw new Error('Appointment not found');
    appointment.status = status;
    appointment.updatedAt = new Date();
    
    let notificationType: NotificationType;
    if (status === 'CONFIRMED') {
      notificationType = 'APPOINTMENT_CONFIRMED';
    } else if (status === 'CANCELLED') {
      notificationType = 'APPOINTMENT_CANCELLED';
    } else {
      notificationType = 'SYSTEM';
    }
    
    this.createNotification(
      appointment.userId,
      notificationType,
      `Appointment ${status}`,
      `Your appointment status has been updated to ${status}`
    );
    
    return {
      ...appointment,
      listing: this.mustListing(appointment.listingId),
      user: publicUser(this.mustUser(appointment.userId)),
    };
  }

  // RTO/NOC methods
  getRtoNoc(listingId: string) {
    return this.rtoNocs.find((item) => item.listingId === listingId) ?? null;
  }

  upsertRtoNoc(listingId: string, patch: Partial<RtoNoc>) {
    this.mustListing(listingId);
    const existing = this.rtoNocs.find((item) => item.listingId === listingId);
    if (existing) {
      Object.assign(existing, patch, { updatedAt: new Date() });
      return existing;
    }

    const now = new Date();
    const rtoNoc: RtoNoc = {
      id: id('noc'),
      listingId,
      rtoTaxStatus: patch.rtoTaxStatus ?? null,
      rtoDues: patch.rtoDues ?? null,
      rtoNocIssued: patch.rtoNocIssued ?? null,
      bankNocStatus: patch.bankNocStatus ?? 'NOT_STARTED',
      rtoNocStatus: patch.rtoNocStatus ?? 'NOT_STARTED',
      invoiceStatus: patch.invoiceStatus ?? 'NOT_STARTED',
      ownerIdStatus: patch.ownerIdStatus ?? 'NOT_STARTED',
      uploadedCount: patch.uploadedCount ?? 0,
      notes: patch.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.rtoNocs.push(rtoNoc);
    return rtoNoc;
  }

  // Dashboard & stats
  bootstrap(city?: string) {
    const listings = this.listListings({ city }).filter((listing) =>
      ['ACTIVE', 'PENDING_INSPECTION'].includes(listing.status),
    );
    return {
      listings,
      stats: {
        activeListings: listings.length,
        pendingAppointments: this.appointments.filter((item) => ['PENDING', 'CONFIRMED'].includes(item.status))
          .length,
        submittedBids: this.bids.filter((item) => item.status === 'SUBMITTED').length,
      },
    };
  }

  getCities() {
    const popular = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Indore', 'Chennai', 'Ahmedabad', 'Gurgaon'];
    const listed = this.listings.map(l => l.city).filter(Boolean) as string[];
    const cities = Array.from(new Set([...popular, ...listed])).sort();
    return { cities };
  }

  dashboard() {
    const recentListings = this.listListings({}).slice(0, 10);
    const succeededPayments = this.payments.filter((item) => item.status === 'SUCCEEDED');
    return {
      stats: {
        users: this.users.length,
        dealers: this.users.filter(u => u.userType === 'DEALER').length,
        listings: this.listings.length,
        activeListings: this.listings.filter((item) => item.status === 'ACTIVE').length,
        pendingListings: this.listings.filter((item) => item.status === 'PENDING_INSPECTION').length,
        submittedBids: this.bids.filter((item) => item.status === 'SUBMITTED').length,
        pendingAppointments: this.appointments.filter((item) => ['PENDING', 'CONFIRMED'].includes(item.status)).length,
        totalPayments: this.payments.length,
        totalRevenue: succeededPayments.reduce((sum, item) => sum + item.amount, 0),
        fraudAlerts: this.fraudAlerts.length,
        activeAutoBids: this.autoBidConfigs.filter((item) => item.isActive).length,
        pendingLeads: this.leads.length,
      },
      recentListings,
      recentBids: this.listBids().slice(0, 10),
      recentAppointments: this.listAppointments({}).slice(0, 10),
      recentPayments: this.payments.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10),
      activeAutoBids: this.autoBidConfigs.filter((item) => item.isActive).length,
    };
  }

  seedDemo() {
    const seller = this.upsertEmailUser('seller@autobidder.demo', 'Demo Seller');
    const buyer = this.upsertEmailUser('buyer@autobidder.demo', 'Demo Buyer');
    const buyer2 = this.upsertEmailUser('buyer2@autobidder.demo', 'Demo Buyer 2');
    
    const listing = this.createListing({
      sellerId: seller.id,
      title: 'Mahindra Thar 2019 - AX (O) D 2WD HT',
      description: 'Demo active listing for admin and mobile testing.',
      brand: 'Mahindra',
      model: 'Thar',
      variant: 'AX (O) D 2WD HT',
      manufacturingYear: 2019,
      fuelType: 'Diesel',
      transmission: 'Manual',
      color: 'Black',
      city: 'Indore',
      latitude: 22.7196,
      longitude: 75.8577,
      plateNumber: 'MP20CC****',
      ownership: '1st Owner',
      kilometersDriven: 42000,
      condition: 'New like',
      demandPrice: 884000,
      startingBid: 804000,
      imageUrl:
        'https://images.unsplash.com/photo-1629897048514-3860bb441113?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
    });
    
    const rtoNoc = this.upsertRtoNoc(listing.id, {
      rtoTaxStatus: 'Paid',
      rtoNocIssued: 'No',
      invoiceStatus: 'IN_PROGRESS',
      ownerIdStatus: 'COMPLETED',
    });
    
    const bid = this.createBid(listing.id, buyer.id, 825000);
    const bid2 = this.createBid(listing.id, buyer2.id, 830000);
    
    const autoBid = this.createAutoBidConfig(buyer.id, listing.id, 850000, 10000);
    
    const appointment = this.createAppointment({
      listingId: listing.id,
      userId: buyer.id,
      type: 'BUYER_INSPECTION',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      location: 'AutoBidder Indore Hub',
    });
    
    const payment = this.createPayment({
      amount: 825000,
      bidId: bid.id,
      listingId: listing.id,
      stripePaymentIntentId: 'pi_demo_123456',
      stripeClientSecret: 'pi_demo_123456_secret',
    });
    this.updatePaymentStatus(payment.id, 'SUCCEEDED');
    
    this.createNotification(buyer.id, 'BID_ACCEPTED', 'Bid Accepted', 'Your bid has been accepted!');
    this.createNotification(buyer2.id, 'OUTBID', 'You have been outbid', 'Someone placed a higher bid');
    
    return { seller, buyer, buyer2, listing, rtoNoc, bid, bid2, autoBid, appointment, payment };
  }

  adminUsers() {
    return {
      stats: { users: this.users.length },
      recentUsers: this.users.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10).map(user => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        createdAt: user.createdAt,
      })),
    };
  }

  adminRto() {
    return {
      rtoNocs: this.rtoNocs.slice().sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 20).map(rto => ({
        ...rto,
        listing: this.mustListing(rto.listingId),
      })),
    };
  }

  adminPayments() {
    return {
      payments: this.payments
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((payment) => ({
          ...payment,
          bid: payment.bidId ? this.bids.find((b) => b.id === payment.bidId) : null,
          listing: payment.listingId ? this.mustListing(payment.listingId) : null,
        })),
      stats: {
        total: this.payments.length,
        succeeded: this.payments.filter((p) => p.status === 'SUCCEEDED').length,
        pending: this.payments.filter((p) => p.status === 'PENDING').length,
        failed: this.payments.filter((p) => p.status === 'FAILED').length,
        totalRevenue: this.payments
          .filter((p) => p.status === 'SUCCEEDED')
          .reduce((sum, p) => sum + p.amount, 0),
      },
    };
  }

  adminAutoBids() {
    return {
      autoBidConfigs: this.getAutoBidConfigs().map((config) => ({
        ...config,
        user: publicUser(this.mustUser(config.userId)),
        listing: this.mustListing(config.listingId),
      })),
      stats: {
        total: this.autoBidConfigs.length,
        active: this.autoBidConfigs.filter((c) => c.isActive).length,
      },
    };
  }

  adminNotifications() {
    return {
      notifications: this.notifications
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 50)
        .map((notif) => ({
          ...notif,
          user: publicUser(this.mustUser(notif.userId)),
        })),
      stats: {
        total: this.notifications.length,
        unread: this.notifications.filter((n) => !n.read).length,
      },
    };
  }

  adminAllUsers() {
    return {
      users: this.users
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((user) => ({
          ...publicUser(user),
          createdAt: user.createdAt,
          _count: {
            listings: this.listings.filter((l) => l.sellerId === user.id).length,
            bids: this.bids.filter((b) => b.userId === user.id).length,
            appointments: this.appointments.filter((a) => a.userId === user.id).length,
            notifications: this.notifications.filter((n) => n.userId === user.id).length,
          },
        })),
    };
  }

  adminPushTokens() {
    return {
      pushTokens: this.pushTokens
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((pt) => ({
          ...pt,
          user: publicUser(this.mustUser(pt.userId)),
        })),
    };
  }

  getFraudAlerts() {
    return this.fraudAlerts
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAuditLogs() {
    return this.auditLogs
      .slice()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getLeads() {
    return this.leads.map(l => ({
      ...l,
      listing: this.listings.find(item => item.id === l.listingId)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getPayouts() {
    return this.payouts.map(p => ({
      ...p,
      user: publicUser(this.mustUser(p.userId))
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  activateDistributor(userId: string) {
    const user = this.mustUser(userId);
    user.isDistributor = true;
    user.distributorStatus = user.distributorStatus ?? 'ACTIVE';
    user.distributorCode = user.distributorCode ?? `AB-DIST-${String(this.users.indexOf(user) + 1001).padStart(4, '0')}`;
    user.referralEarnings = user.referralEarnings ?? 0;
    return publicUser(user);
  }

  getDistributorByCode(code: string) {
    return this.users.find((u) => u.distributorCode === code && u.isDistributor);
  }

  refreshDistributorCommission(listingId: string) {
    const listing = this.mustListing(listingId);
    if (!listing.referredByUserId) return listing;
    const distributor = this.mustUser(listing.referredByUserId);
    let amount = 0;
    let status: Listing['distributorCommissionStatus'] = 'PENDING';
    if (listing.status === 'ACTIVE') amount += 1000;
    if (listing.status === 'SOLD') amount += Math.floor((listing.demandPrice ?? listing.startingBid ?? 0) * 0.02);
    if (listing.status === 'REJECTED') status = 'REJECTED';
    if (status !== 'REJECTED' && amount === 0) status = 'PENDING';
    listing.distributorCommissionAmount = amount;
    listing.distributorCommissionStatus = status;
    distributor.referralEarnings = this.listings
      .filter((item) => item.referredByUserId === distributor.id && item.distributorCommissionStatus !== 'REJECTED')
      .reduce((sum, item) => sum + (item.distributorCommissionAmount ?? 0), 0);
    return listing;
  }

  getDistributorDashboard(userId: string) {
    const distributor = this.mustUser(userId);
    if (!distributor.isDistributor) throw new Error('User is not a distributor');
    const referrals = this.listings
      .filter((listing) => listing.referredByUserId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((listing) => {
        const seller = this.mustUser(listing.sellerId);
        return {
          listingId: listing.id,
          listingTitle: listing.title,
          sellerName: seller.name ?? null,
          sellerPhone: seller.phone ?? null,
          status: listing.status,
          commissionAmount: listing.distributorCommissionAmount ?? 0,
          commissionStatus: listing.distributorCommissionStatus ?? 'NONE',
          createdAt: listing.createdAt,
        };
      });
    return {
      distributor: publicUser(distributor),
      stats: {
        totalReferrals: referrals.length,
        activeListings: referrals.filter((r) => r.status === 'ACTIVE').length,
        soldListings: referrals.filter((r) => r.status === 'SOLD').length,
        totalEarnings: referrals.reduce((sum, r) => sum + r.commissionAmount, 0),
        pendingEarnings: referrals.filter((r) => r.commissionStatus === 'PENDING').reduce((sum, r) => sum + r.commissionAmount, 0),
        paidEarnings: referrals.filter((r) => r.commissionStatus === 'PAID').reduce((sum, r) => sum + r.commissionAmount, 0),
      },
      referralLink: `autobidder.in/list?ref=${distributor.distributorCode}`,
      referrals,
      shareTemplates: {
        appInvite: `Join AutoBidder and list your car with my referral code ${distributor.distributorCode}. Start here: autobidder.in/list?ref=${distributor.distributorCode}`,
        listingInvite: `List your car on AutoBidder using referral code ${distributor.distributorCode} and get started today: autobidder.in/list?ref=${distributor.distributorCode}`,
      },
    };
  }

  getDistributors() {
    return this.users
      .filter((u) => u.isDistributor)
      .map((u) => ({
        ...publicUser(u),
        referralCount: this.listings.filter((l) => l.referredByUserId === u.id).length,
      }))
      .sort((a, b) => (b.referralEarnings ?? 0) - (a.referralEarnings ?? 0));
  }

  updateDistributorStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
    const user = this.mustUser(userId);
    user.isDistributor = true;
    user.distributorStatus = status;
    return publicUser(user);
  }

  processPayout(id: string) {
    const p = this.payouts.find(item => item.id === id);
    if (!p) throw new Error('Payout not found');
    p.status = 'PROCESSED';
    return p;
  }

  getCommissions() {
    const platform = this.payments.filter(p => p.status === 'SUCCEEDED').map(p => ({
      id: id('com'),
      partnerName: 'Platform',
      partnerType: 'PLATFORM',
      amount: Math.floor(p.amount * 0.05),
      paymentId: p.id,
      listingId: p.listingId,
      createdAt: p.createdAt,
      status: 'ACCRUED'
    }));
    const distributor = this.listings
      .filter(l => l.referredByUserId && (l.distributorCommissionAmount ?? 0) > 0)
      .map(l => ({
        id: id('dcom'),
        partnerName: this.mustUser(l.referredByUserId as string).name || 'Distributor',
        partnerType: 'DISTRIBUTOR',
        amount: l.distributorCommissionAmount ?? 0,
        paymentId: null,
        listingId: l.id,
        createdAt: l.updatedAt,
        status: l.distributorCommissionStatus ?? 'PENDING'
      }));
    return [...platform, ...distributor].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Slider methods
  listSliders(query: { type?: 'ONBOARDING' | 'HOME' | 'BUY_CAR' | 'SELL_CAR', isActive?: boolean }) {
    return this.sliders
      .filter((s) => {
        return (!query.type || s.type === query.type) &&
               (query.isActive === undefined || s.isActive === query.isActive);
      })
      .sort((a, b) => a.order - b.order || b.createdAt.getTime() - a.createdAt.getTime());
  }

  createSlider(input: Omit<Slider, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const slider: Slider = {
      id: id('sld'),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.sliders.push(slider);
    return slider;
  }

  updateSlider(id: string, patch: Partial<Slider>) {
    const slider = this.sliders.find(s => s.id === id);
    if (!slider) throw new Error('Slider not found');
    Object.assign(slider, patch, { updatedAt: new Date() });
    return slider;
  }

  deleteSlider(id: string) {
    const index = this.sliders.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Slider not found');
    this.sliders.splice(index, 1);
    return true;
  }

  seedRich() {
    // Create diverse users
    const seller1 = this.upsertEmailUser('seller1@autobidder.demo', 'Rajesh Kumar');
    this.updateUser(seller1.id, { kycImageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=800&q=80', isVerified: false });
    const seller2 = this.upsertEmailUser('seller2@autobidder.demo', 'Priya Sharma');
    this.updateUser(seller2.id, { kycImageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=800&q=80', isVerified: false });
    const buyer1 = this.upsertEmailUser('buyer1@autobidder.demo', 'Amit Patel');
    const buyer2 = this.upsertEmailUser('buyer2@autobidder.demo', 'Sneha Verma');
    const buyer3 = this.upsertEmailUser('buyer3@autobidder.demo', 'Vikram Singh');

    const carData = [
      { brand: 'Maruti Suzuki', model: 'Swift', variant: 'VXi AMT', year: 2022, fuel: 'Petrol', trans: 'Automatic', color: 'Pearl Red', city: 'Mumbai', km: 18000, demand: 750000, plate: 'MH01AB1234', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Hatchback' },
      { brand: 'Hyundai', model: 'Creta', variant: 'SX(O)', year: 2023, fuel: 'Petrol', trans: 'Automatic', color: 'Typhoon Silver', city: 'Bangalore', km: 9500, demand: 1450000, plate: 'KA01BB5678', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Tata Motors', model: 'Nexon EV', variant: 'Max XZ+', year: 2023, fuel: 'Electric', trans: 'Automatic', color: 'Pristine White', city: 'Pune', km: 22000, demand: 1680000, plate: 'MH12CC9012', own: '1st Owner', status: 'PENDING_INSPECTION' as const, carType: 'SUV Cars' },
      { brand: 'Honda', model: 'City', variant: 'ZX CVT', year: 2021, fuel: 'Petrol', trans: 'Automatic', color: 'Platinum White', city: 'Delhi', km: 34000, demand: 1150000, plate: 'DL7CX3456', own: '2nd Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'Kia', model: 'Seltos', variant: 'HTX+', year: 2022, fuel: 'Diesel', trans: 'Manual', color: 'Glacier White', city: 'Hyderabad', km: 28000, demand: 1320000, plate: 'TS09DD7890', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Mahindra', model: 'Thar', variant: 'LX Hard Top', year: 2023, fuel: 'Diesel', trans: 'Automatic', color: 'Everest White', city: 'Indore', km: 12000, demand: 1850000, plate: 'MP09EE2345', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Toyota', model: 'Innova Crysta', variant: '2.4 VX', year: 2020, fuel: 'Diesel', trans: 'Manual', color: 'Silver Metallic', city: 'Chennai', km: 65000, demand: 2100000, plate: 'TN22FF6789', own: '1st Owner', status: 'PENDING_INSPECTION' as const, carType: 'SUV Cars' },
      { brand: 'MG Motors', model: 'Hector', variant: 'Sharp Pro', year: 2022, fuel: 'Petrol', trans: 'Automatic', color: 'Candy White', city: 'Ahmedabad', km: 31000, demand: 1580000, plate: 'GJ01GG1234', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Renault', model: 'Kwid', variant: 'RXT', year: 2021, fuel: 'Petrol', trans: 'Manual', color: 'Ice Cool White', city: 'Indore', km: 22000, demand: 420000, plate: 'MP09RN1234', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Budget Cars' },
      { brand: 'Ford', model: 'EcoSport', variant: 'Titanium S', year: 2019, fuel: 'Diesel', trans: 'Manual', color: 'Canyon Ridge', city: 'Ahmedabad', km: 48000, demand: 850000, plate: 'GJ01FR5678', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Nissan', model: 'Magnite', variant: 'XV Premium', year: 2022, fuel: 'Petrol', trans: 'Automatic', color: 'Flare Garnet Red', city: 'Jaipur', km: 15000, demand: 980000, plate: 'RJ14NS9012', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Volkswagen', model: 'Virtus', variant: 'GT Plus', year: 2023, fuel: 'Petrol', trans: 'Automatic', color: 'Wild Cherry Red', city: 'Mumbai', km: 5000, demand: 1750000, plate: 'MH01HH1234', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'BMW', model: '3 Series', variant: '330i M Sport', year: 2020, fuel: 'Petrol', trans: 'Automatic', color: 'Portimao Blue', city: 'Mumbai', km: 45000, demand: 4200000, plate: 'MH01LL3456', own: '2nd Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'Audi', model: 'Q3', variant: 'Premium Plus', year: 2022, fuel: 'Petrol', trans: 'Automatic', color: 'Mythos Black', city: 'Gurgaon', km: 12000, demand: 4800000, plate: 'HR26MM7890', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Mercedes', model: 'C-Class', variant: 'C200', year: 2021, fuel: 'Petrol', trans: 'Automatic', color: 'Mojave Silver', city: 'Delhi', km: 20000, demand: 5200000, plate: 'DL3NN1234', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'Land Rover', model: 'Range Rover Velar', variant: 'Dynamic HSE', year: 2023, fuel: 'Diesel', trans: 'Automatic', color: 'Santorini Black', city: 'Mumbai', km: 12000, demand: 9500000, plate: 'MH01RR5678', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Citroen', model: 'C3', variant: 'Feel', year: 2023, fuel: 'Petrol', trans: 'Manual', color: 'Zesty Orange', city: 'Lucknow', km: 8000, demand: 720000, plate: 'UP32CT3456', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Hatchback' },
      { brand: 'Fiat', model: 'Punto', variant: 'Abarth', year: 2018, fuel: 'Petrol', trans: 'Manual', color: 'Black', city: 'Pune', km: 35000, demand: 650000, plate: 'MH12FT7890', own: '2nd Owner', status: 'ACTIVE' as const, carType: 'Hatchback' },
      { brand: 'Isuzu', model: 'D-Max V-Cross', variant: 'Z', year: 2021, fuel: 'Diesel', trans: 'Automatic', color: 'Silky White Pearl', city: 'Guwahati', km: 25000, demand: 2800000, plate: 'AS01IS1234', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Mitsubishi', model: 'Pajero Sport', variant: 'Select Plus', year: 2018, fuel: 'Diesel', trans: 'Automatic', color: 'Deep Blue', city: 'Kochi', km: 75000, demand: 2200000, plate: 'KL07MB5678', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Force Motors', model: 'Gurkha', variant: '4x4', year: 2022, fuel: 'Diesel', trans: 'Manual', color: 'Red', city: 'Shimla', km: 12000, demand: 1550000, plate: 'HP01FM9012', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Datsun', model: 'GO+', variant: 'T(O)', year: 2020, fuel: 'Petrol', trans: 'Manual', color: 'Silver', city: 'Chandigarh', km: 28000, demand: 450000, plate: 'CH01DS3456', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Budget Cars' },
      { brand: 'Jaguar', model: 'XF', variant: 'Prestige', year: 2021, fuel: 'Diesel', trans: 'Automatic', color: 'Fuji White', city: 'Mumbai', km: 18000, demand: 5800000, plate: 'MH01JG7890', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'Volvo', model: 'XC40 Recharge', variant: 'Ultimate', year: 2023, fuel: 'Electric', trans: 'Automatic', color: 'Crystal White', city: 'Bangalore', km: 5000, demand: 5500000, plate: 'KA01VL1234', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Lexus', model: 'ES', variant: '300h Exquisite', year: 2022, fuel: 'Hybrid', trans: 'Automatic', color: 'Sonic Quartz', city: 'Delhi', km: 12000, demand: 6200000, plate: 'DL1LX5678', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'Porsche', model: '911 Carrera', variant: 'S', year: 2022, fuel: 'Petrol', trans: 'Automatic', color: 'Guards Red', city: 'Mumbai', km: 3000, demand: 18500000, plate: 'MH01PS9012', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'Lamborghini', model: 'Urus', variant: 'V8', year: 2023, fuel: 'Petrol', trans: 'Automatic', color: 'Giallo Auge', city: 'Delhi', km: 2000, demand: 42000000, plate: 'DL1LB3456', own: '1st Owner', status: 'ACTIVE' as const, carType: 'SUV Cars' },
      { brand: 'Ferrari', model: 'F8 Tributo', variant: 'V8', year: 2022, fuel: 'Petrol', trans: 'Automatic', color: 'Rosso Corsa', city: 'Mumbai', km: 1500, demand: 48000000, plate: 'MH01FR7890', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'Maserati', model: 'Ghibli', variant: 'Trofeo', year: 2021, fuel: 'Petrol', trans: 'Automatic', color: 'Blu Emozione', city: 'Bangalore', km: 8000, demand: 14500000, plate: 'KA01MS1234', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'Bentley', model: 'Continental GT', variant: 'V8', year: 2023, fuel: 'Petrol', trans: 'Automatic', color: 'Sequin Blue', city: 'Delhi', km: 1000, demand: 45000000, plate: 'DL1BT5678', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'Rolls Royce', model: 'Ghost', variant: 'V12', year: 2022, fuel: 'Petrol', trans: 'Automatic', color: 'Arctic White', city: 'Mumbai', km: 2500, demand: 75000000, plate: 'MH01RR9012', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Sedan' },
      { brand: 'Mini Cooper', model: 'Cooper S', variant: '3-Door', year: 2023, fuel: 'Petrol', trans: 'Automatic', color: 'Chili Red', city: 'Pune', km: 4000, demand: 4500000, plate: 'MH12MC3456', own: '1st Owner', status: 'ACTIVE' as const, carType: 'Hatchback' },
    ];

    const listings = carData.map((car, i) =>
      this.createListing({
        sellerId: i % 2 === 0 ? seller1.id : seller2.id,
        title: `${car.brand} ${car.model} ${car.variant}`,
        brand: car.brand, model: car.model, variant: car.variant,
        manufacturingYear: car.year, fuelType: car.fuel, transmission: car.trans,
        carType: car.carType,
        color: car.color, city: car.city, plateNumber: car.plate,
        ownership: car.own, kilometersDriven: car.km,
        demandPrice: car.demand, startingBid: Math.floor(car.demand * 0.9),
        status: car.status,
        rcImages: ['https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=800&q=80'],
        images: [
          `https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=60&sig=${i}`,
          'https://images.unsplash.com/photo-1541899481282-d53bffe3c15d?auto=format&fit=crop&w=800&q=80'
        ],
        inspectionReportUrl: i % 2 === 0 ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : null,
        inspectionReportStatus: i % 2 === 0 ? 'COMPLETED' : 'PENDING'
      })
    );

    listings.forEach((l, i) => {
      this.upsertRtoNoc(l.id, {
        rtoTaxStatus: 'Paid', rtoNocIssued: i % 3 === 0 ? 'Yes' : 'No',
        bankNocStatus: i % 2 === 0 ? 'COMPLETED' : 'IN_PROGRESS',
        rtoNocStatus: i % 3 === 0 ? 'COMPLETED' : 'NOT_STARTED',
        invoiceStatus: 'IN_PROGRESS', ownerIdStatus: 'COMPLETED', uploadedCount: i + 1,
      });
    });

    this.createBid(listings[0].id, buyer1.id, Math.floor(carData[0].demand * 0.92));
    this.createBid(listings[0].id, buyer2.id, Math.floor(carData[0].demand * 0.94));
    const b2 = this.createBid(listings[0].id, buyer3.id, Math.floor(carData[0].demand * 0.96));
    this.createBid(listings[1].id, buyer1.id, Math.floor(carData[1].demand * 0.91));
    this.createBid(listings[1].id, buyer3.id, Math.floor(carData[1].demand * 0.93));
    this.createBid(listings[2].id, buyer2.id, Math.floor(carData[2].demand * 0.92));
    this.createBid(listings[3].id, buyer1.id, Math.floor(carData[3].demand * 0.91));
    this.createBid(listings[4].id, buyer2.id, Math.floor(carData[4].demand * 0.91));

    this.createAppointment({ listingId: listings[0].id, userId: buyer1.id, type: 'BUYER_INSPECTION', scheduledAt: new Date(Date.now() + 86400000).toISOString(), location: 'AutoBidder Mumbai Hub' });
    this.createAppointment({ listingId: listings[1].id, userId: buyer3.id, type: 'AUTOBIDDER_INSPECTION', scheduledAt: new Date(Date.now() + 172800000).toISOString(), location: 'AutoBidder Bangalore Center' });
    this.createAppointment({ listingId: listings[2].id, userId: buyer2.id, type: 'AUTHORIZED_CENTER', scheduledAt: new Date(Date.now() + 259200000).toISOString(), location: 'Tata Authorized - Pune' });

    this.createAutoBidConfig(buyer1.id, listings[1].id, Math.floor(carData[1].demand * 0.98), 10000);
    this.createAutoBidConfig(buyer2.id, listings[2].id, Math.floor(carData[2].demand * 0.97), 15000);

    const pay = this.createPayment({ amount: b2.amount, bidId: b2.id, listingId: listings[0].id, stripePaymentIntentId: 'pi_rich_demo_001', stripeClientSecret: 'pi_rich_secret_001' });
    this.updatePaymentStatus(pay.id, 'SUCCEEDED');

    this.createNotification(buyer1.id, 'BID_ACCEPTED', 'Bid Accepted!', `Your bid on ${listings[0].title} was accepted.`);
    this.createNotification(buyer2.id, 'OUTBID', 'You were outbid', `Higher bid placed on ${listings[0].title}`);
    this.createNotification(buyer3.id, 'PAYMENT_CONFIRMED', 'Payment Confirmed', 'Your payment was processed successfully.');
    this.createNotification(seller1.id, 'LISTING_SOLD', 'Car Sold!', `${listings[0].title} has been sold!`);
    this.createNotification(buyer1.id, 'APPOINTMENT_CONFIRMED', 'Appointment Confirmed', 'Your inspection at AutoBidder Mumbai Hub is confirmed.');

    this.registerPushToken(buyer1.id, 'ExponentPushToken[demo_buyer1_android]', 'android');
    this.registerPushToken(buyer2.id, 'ExponentPushToken[demo_buyer2_ios]', 'ios');
    this.registerPushToken(buyer3.id, 'ExponentPushToken[demo_buyer3_android]', 'android');

    // Add some fraud alerts
    this.fraudAlerts.push({
      id: id('fraud'),
      type: 'Multiple Bids',
      description: 'Rapid bidding detected from single IP',
      severity: 'HIGH',
      userId: buyer1.id,
      userName: buyer1.name,
      createdAt: new Date(),
    });
    this.fraudAlerts.push({
      id: id('fraud'),
      type: 'Account Shared',
      description: 'Login from multiple cities within 1h',
      severity: 'MEDIUM',
      userId: seller1.id,
      userName: seller1.name,
      createdAt: new Date(Date.now() - 3600000),
    });

    // Add some audit logs
    this.auditLogs.push({
      id: id('log'),
      action: 'USER_VERIFIED',
      adminName: 'SuperAdmin',
      target: buyer1.id,
      details: { previousStatus: 'UNVERIFIED', method: 'MANUAL_ID_CHECK' },
      timestamp: new Date(),
    });
    this.auditLogs.push({
      id: id('log'),
      action: 'LISTING_STATUS_CHANGED',
      adminName: 'AutoBot',
      target: listings[0].id,
      details: { status: 'ACTIVE' },
      timestamp: new Date(Date.now() - 7200000),
    });

    // Seed Leads
    this.leads.push({ id: id('led'), name: 'Rahul Khanna', email: 'rahul@example.com', phone: '9876543210', listingId: listings[0].id, createdAt: new Date() });
    this.leads.push({ id: id('led'), name: 'Sonal Mittal', email: 'sonal@example.com', phone: '9876543211', listingId: listings[1].id, createdAt: new Date(Date.now() - 86400000) });

    // Seed Payouts
    this.payouts.push({ id: id('pay'), userId: seller1.id, amount: 50000, status: 'PENDING', createdAt: new Date() });

    // Seed Sliders
    this.createSlider({
      type: 'ONBOARDING',
      title: 'Precision Bidding',
      subtitle: 'Real-time auctions with transparent bidding history for every vehicle.',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=400&q=80',
      order: 1,
      isActive: true,
    });
    this.createSlider({
      type: 'ONBOARDING',
      title: 'Verified Inventory',
      subtitle: 'Every car undergoes a multi-point inspection by our expert team.',
      imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80',
      order: 2,
      isActive: true,
    });
    this.createSlider({
      type: 'HOME',
      title: 'Find Your Dream Car With The Best Bids',
      subtitle: 'START BIDDING >',
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      link: '/BuyCar',
      order: 1,
      isActive: true,
    });
    this.createSlider({
      type: 'HOME',
      title: 'Feature Your Listing And Sell Faster!',
      subtitle: 'FOR BEST OFFERS',
      imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
      link: '/SellCar',
      order: 2,
      isActive: true,
    });

    this.createSlider({
      type: 'BUY_CAR',
      title: 'Own your car today! Easy and fast loans await.',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=600&q=80',
      order: 1,
      isActive: true,
    });

    this.createSlider({
      type: 'BUY_CAR',
      title: 'Get the best value for your old car.',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=600&q=80',
      order: 2,
      isActive: true,
    });

    this.createSlider({
      type: 'SELL_CAR',
      title: 'Get The Best Price For Your Car!',
      imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
      order: 1,
      isActive: true,
    });

    // Seed Brands
    const LOGO_BASE_URL = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized';
    const initialBrands = [
      { name: 'Maruti Suzuki', logo: `${LOGO_BASE_URL}/suzuki.png`, count: '2.5k+ Cars' },
      { name: 'Hyundai', logo: `${LOGO_BASE_URL}/hyundai.png`, count: '1.8k+ Cars' },
      { name: 'Tata Motors', logo: `${LOGO_BASE_URL}/tata.png`, count: '1.2k+ Cars' },
      { name: 'Mahindra', logo: `${LOGO_BASE_URL}/mahindra.png`, count: '950+ Cars' },
      { name: 'Kia', logo: `${LOGO_BASE_URL}/kia.png`, count: '600+ Cars' },
      { name: 'Honda', logo: `${LOGO_BASE_URL}/honda.png`, count: '850+ Cars' },
      { name: 'Toyota', logo: `${LOGO_BASE_URL}/toyota.png`, count: '700+ Cars' },
    ];

    initialBrands.forEach((b, i) => {
      this.createBrand({
        ...b,
        description: `Experience the best of ${b.name} with our certified pre-owned collection. Every vehicle undergoes a 140-point quality check.`,
        order: i + 1,
        isActive: true
      });
    });

    return { ok: true, message: 'Rich demo seeded', counts: { users: 5, listings: listings.length, bids: 8, appointments: 3, payments: 1 } };
  }

  // Private helpers
  private hydrateListing(listing: Listing) {
    const highestBid = this.bidsForListing(listing.id)[0];
    const latestAppointment = this.appointments
      .filter((appointment) => appointment.listingId === listing.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return {
      ...listing,
      seller: publicUser(this.mustUser(listing.sellerId)),
      bids: highestBid ? [highestBid] : [],
      appointments: latestAppointment ? [latestAppointment] : [],
      rtoNoc: this.getRtoNoc(listing.id),
    };
  }

  private bidsForListing(listingId: string) {
    return this.bids
      .filter((bid) => bid.listingId === listingId)
      .sort((a, b) => b.amount - a.amount);
  }

  private mustListing(listingId: string) {
    const listing = this.listings.find((item) => item.id === listingId);
    if (!listing) throw new Error('Listing not found');
    return listing;
  }

  private mustUser(userId: string) {
    const user = this.users.find((item) => item.id === userId);
    if (!user) throw new Error('User not found');
    return user;
  }
}

export const devStore = new DevStore();
