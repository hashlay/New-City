import fs from 'fs';
import path from 'path';
import {
  Customer,
  SchemeCard,
  Installment,
  Payment,
  PaymentAllocation,
  Draw,
  Winner,
  Settings,
  DashboardStats,
  PaymentAllocationResult,
} from '@/types';
import {
  initialCustomers,
  initialSchemeCards,
  generateDemoInstallmentsAndPayments,
  initialDraws,
  initialWinners,
  initialSettings,
} from './demoData';
import {
  allocatePayment,
  calculateRemainingBalance,
  generateInstallmentSchedule,
} from './paymentLogic';

// Local storage path for persistent mode (supports Vercel serverless /tmp environment)
const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', '.data')
  : path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseStore {
  customers: Customer[];
  schemeCards: SchemeCard[];
  installments: Installment[];
  payments: Payment[];
  allocations: PaymentAllocation[];
  draws: Draw[];
  winners: Winner[];
  settings: Settings;
}

// In-memory cache synced with disk or initialized from demo data
let memoryStore: DatabaseStore | null = null;

// High-performance computed memoization cache
let cachedComputedCards: SchemeCard[] | null = null;
let cachedDashboard: any | null = null;

function invalidateComputedCache() {
  cachedComputedCards = null;
  cachedDashboard = null;
}

function ensureDataInitialized(): DatabaseStore {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(content);
      if (memoryStore && memoryStore.customers && memoryStore.customers.length > 0) {
        return memoryStore;
      }
    }
  } catch (err) {
    console.error('Error reading local db file, re-initializing demo data:', err);
  }

  // Generate demo data
  const { installments, payments, allocations } = generateDemoInstallmentsAndPayments();
  memoryStore = {
    customers: [...initialCustomers],
    schemeCards: [...initialSchemeCards],
    installments,
    payments,
    allocations,
    draws: [...initialDraws],
    winners: [...initialWinners],
    settings: { ...initialSettings },
  };

  saveStore(memoryStore);
  return memoryStore;
}

function saveStore(store: DatabaseStore) {
  invalidateComputedCache();
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Async or non-blocking write
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db file:', err);
  }
}

// Public High-Performance Database Service API
export const db = {
  // Reset or Seed Demo Data
  resetToDemoData(): DatabaseStore {
    const { installments, payments, allocations } = generateDemoInstallmentsAndPayments();
    memoryStore = {
      customers: [...initialCustomers],
      schemeCards: [...initialSchemeCards],
      installments,
      payments,
      allocations,
      draws: [...initialDraws],
      winners: [...initialWinners],
      settings: { ...initialSettings },
    };
    saveStore(memoryStore);
    return memoryStore;
  },

  // CUSTOMERS
  getCustomers(searchQuery?: string): Customer[] {
    const store = ensureDataInitialized();
    let list = store.customers;

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const customerCards = store.schemeCards.filter((sc) => sc.customerId === c._id);
        const matchesCard = customerCards.some((sc) => sc.cardNumber.toLowerCase().includes(q));
        return matchesName || matchesPhone || matchesCard;
      });
    }

    return list;
  },

  getCustomerById(id: string): (Customer & { schemeCards?: SchemeCard[] }) | null {
    const store = ensureDataInitialized();
    const customer = store.customers.find((c) => c._id === id);
    if (!customer) return null;

    const cards = db.getSchemeCardsByCustomerId(id);
    return { ...customer, schemeCards: cards };
  },

  createCustomer(data: { name: string; phone: string; address?: string; notes?: string }): Customer {
    const store = ensureDataInitialized();
    const newCustomer: Customer = {
      _id: `cust-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address?.trim() || '',
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    store.customers.unshift(newCustomer);
    saveStore(store);
    return newCustomer;
  },

  updateCustomer(id: string, data: Partial<Customer>): Customer | null {
    const store = ensureDataInitialized();
    const index = store.customers.findIndex((c) => c._id === id);
    if (index === -1) return null;

    store.customers[index] = {
      ...store.customers[index],
      ...data,
      _id: id,
    };

    saveStore(store);
    return store.customers[index];
  },

  deleteCustomer(id: string): boolean {
    const store = ensureDataInitialized();
    const custIndex = store.customers.findIndex((c) => c._id === id);
    if (custIndex === -1) return false;

    store.customers.splice(custIndex, 1);

    const cardsToRemove = store.schemeCards.filter((sc) => sc.customerId === id);
    const cardIds = new Set(cardsToRemove.map((c) => c._id));

    store.schemeCards = store.schemeCards.filter((sc) => sc.customerId !== id);
    store.installments = store.installments.filter((inst) => !cardIds.has(inst.schemeCardId));
    store.payments = store.payments.filter((p) => p.customerId !== id);
    store.allocations = store.allocations.filter((a) => !cardIds.has(a.schemeCardId));
    store.winners = store.winners.filter((w) => w.customerId !== id);

    saveStore(store);
    return true;
  },

  // SCHEME CARDS - Optimized with In-Memory Caching
  getSchemeCards(searchQuery?: string): SchemeCard[] {
    const store = ensureDataInitialized();

    if (!cachedComputedCards) {
      // Map customer lookup for O(1) joins
      const customerMap = new Map<string, Customer>();
      for (const c of store.customers) {
        customerMap.set(c._id, c);
      }

      // Map installments by schemeCardId for O(1) group lookup
      const installmentsByCard = new Map<string, Installment[]>();
      for (const inst of store.installments) {
        let list = installmentsByCard.get(inst.schemeCardId);
        if (!list) {
          list = [];
          installmentsByCard.set(inst.schemeCardId, list);
        }
        list.push(inst);
      }

      cachedComputedCards = store.schemeCards.map((card) => {
        const customer = customerMap.get(card.customerId);
        const cardInstallments = installmentsByCard.get(card._id) || [];

        let totalPaid = 0;
        let pendingCount = 0;
        let advanceCount = 0;
        let paidCount = 0;
        let nextDue: Installment | null = null;

        for (const i of cardInstallments) {
          totalPaid += i.paidAmount;
          if (i.status === 'Pending' || i.status === 'Overdue') pendingCount++;
          if (i.status === 'Advance') advanceCount++;
          if (i.status === 'Paid' || i.status === 'Advance') paidCount++;
          if (!nextDue && i.paidAmount < i.dueAmount) nextDue = i;
        }

        const remainingAmount = calculateRemainingBalance(card.totalAmount, totalPaid);

        return {
          ...card,
          customer,
          totalPaid,
          remainingAmount,
          pendingInstallmentsCount: pendingCount,
          advanceInstallmentsCount: advanceCount,
          paidInstallmentsCount: paidCount,
          nextPaymentDue: nextDue ? nextDue.dueDate : null,
        };
      });
    }

    let cards = cachedComputedCards;

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      cards = cards.filter((c) => {
        const matchesCardNo = c.cardNumber.toLowerCase().includes(q);
        const matchesScheme = c.schemeName.toLowerCase().includes(q);
        const matchesCustName = c.customer?.name.toLowerCase().includes(q) || false;
        const matchesCustPhone = c.customer?.phone.toLowerCase().includes(q) || false;
        return matchesCardNo || matchesScheme || matchesCustName || matchesCustPhone;
      });
    }

    return cards;
  },

  getSchemeCardById(id: string): (SchemeCard & { installments?: Installment[]; payments?: Payment[] }) | null {
    const cards = db.getSchemeCards();
    const card = cards.find((c) => c._id === id);
    if (!card) return null;

    const store = ensureDataInitialized();
    const installments = store.installments
      .filter((i) => i.schemeCardId === id)
      .sort((a, b) => a.installmentNumber - b.installmentNumber);

    const payments = store.payments
      .filter((p) => p.schemeCardId === id)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    return {
      ...card,
      installments,
      payments,
    };
  },

  getSchemeCardsByCustomerId(customerId: string): SchemeCard[] {
    const cards = db.getSchemeCards();
    return cards.filter((c) => c.customerId === customerId);
  },

  createSchemeCard(data: {
    customerId: string;
    schemeName?: string;
    cardNumber: string;
    monthlyInstallment: number;
    totalInstallments: number;
    totalAmount: number;
    startDate: string;
    status?: SchemeCard['status'];
  }): SchemeCard {
    const store = ensureDataInitialized();

    const existing = store.schemeCards.find(
      (sc) => sc.cardNumber.toUpperCase() === data.cardNumber.trim().toUpperCase()
    );
    if (existing) {
      throw new Error(`Scheme Card number "${data.cardNumber}" already exists.`);
    }

    const cardId = `card-${Date.now()}`;
    const newCard: SchemeCard = {
      _id: cardId,
      customerId: data.customerId,
      schemeName: data.schemeName || 'New City Scheme',
      cardNumber: data.cardNumber.trim().toUpperCase(),
      monthlyInstallment: Number(data.monthlyInstallment) || 500,
      totalInstallments: Number(data.totalInstallments) || 20,
      totalAmount: Number(data.totalAmount) || 10000,
      startDate: data.startDate || new Date().toISOString(),
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
    };

    store.schemeCards.unshift(newCard);

    const schedule = generateInstallmentSchedule(
      cardId,
      newCard.totalInstallments,
      newCard.monthlyInstallment,
      newCard.startDate
    );

    const generatedInstallments: Installment[] = schedule.map((item, index) => ({
      ...item,
      _id: `inst-${cardId}-${index + 1}`,
    }));

    store.installments.push(...generatedInstallments);

    saveStore(store);
    return newCard;
  },

  updateSchemeCard(id: string, data: Partial<SchemeCard>): SchemeCard | null {
    const store = ensureDataInitialized();
    const index = store.schemeCards.findIndex((c) => c._id === id);
    if (index === -1) return null;

    store.schemeCards[index] = {
      ...store.schemeCards[index],
      ...data,
      _id: id,
    };

    saveStore(store);
    return store.schemeCards[index];
  },

  deleteSchemeCard(id: string): boolean {
    const store = ensureDataInitialized();
    const index = store.schemeCards.findIndex((c) => c._id === id);
    if (index === -1) return false;

    store.schemeCards.splice(index, 1);
    store.installments = store.installments.filter((i) => i.schemeCardId !== id);
    store.payments = store.payments.filter((p) => p.schemeCardId !== id);
    store.allocations = store.allocations.filter((a) => a.schemeCardId !== id);
    store.winners = store.winners.filter((w) => w.schemeCardId !== id);

    saveStore(store);
    return true;
  },

  // PAYMENTS & ALLOCATION ENGINE
  recordPayment(data: {
    customerId: string;
    schemeCardId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: Payment['paymentMethod'];
    notes?: string;
  }): { payment: Payment; allocationResult: PaymentAllocationResult } {
    const store = ensureDataInitialized();
    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Please enter a valid payment amount greater than zero.');
    }

    const card = store.schemeCards.find((c) => c._id === data.schemeCardId);
    if (!card) {
      throw new Error('Scheme card not found.');
    }

    const cardInstallments = store.installments.filter((i) => i.schemeCardId === data.schemeCardId);
    if (cardInstallments.length === 0) {
      throw new Error('No installment schedule found for this card.');
    }

    const allocationResult = allocatePayment(cardInstallments, amount, data.paymentDate);

    const paymentId = `pay-${Date.now()}`;
    const newPayment: Payment = {
      _id: paymentId,
      customerId: data.customerId,
      schemeCardId: data.schemeCardId,
      amount,
      paymentDate: data.paymentDate || new Date().toISOString(),
      paymentMethod: data.paymentMethod || 'Cash',
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      installmentsCovered: allocationResult.installmentsCoveredNumbers,
    };

    for (const update of allocationResult.installmentsToUpdate) {
      const instIndex = store.installments.findIndex((i) => i._id === update.installmentId);
      if (instIndex !== -1) {
        store.installments[instIndex].paidAmount = update.newPaidAmount;
        store.installments[instIndex].status = update.newStatus;
        if (update.isFullyPaidNow) {
          store.installments[instIndex].paidDate = data.paymentDate || new Date().toISOString();
        }

        store.allocations.push({
          _id: `alloc-${Date.now()}-${update.installmentNumber}`,
          paymentId,
          schemeCardId: data.schemeCardId,
          installmentId: update.installmentId,
          installmentNumber: update.installmentNumber,
          amount: update.allocatedAmount,
          allocatedDate: data.paymentDate || new Date().toISOString(),
        });
      }
    }

    store.payments.unshift(newPayment);

    // Check if card is completed
    const updatedCardInstallments = store.installments.filter((i) => i.schemeCardId === data.schemeCardId);
    const totalPaidOnCard = updatedCardInstallments.reduce((sum, i) => sum + i.paidAmount, 0);
    if (totalPaidOnCard >= card.totalAmount) {
      const cardIdx = store.schemeCards.findIndex((c) => c._id === data.schemeCardId);
      if (cardIdx !== -1) {
        store.schemeCards[cardIdx].status = 'Completed';
      }
    }

    saveStore(store);

    return {
      payment: newPayment,
      allocationResult,
    };
  },

  getPayments(filters?: {
    search?: string;
    customerId?: string;
    schemeCardId?: string;
    paymentMethod?: string;
  }): Payment[] {
    const store = ensureDataInitialized();
    const custMap = new Map(store.customers.map((c) => [c._id, c]));
    const cardMap = new Map(store.schemeCards.map((sc) => [sc._id, sc]));

    let payments = store.payments.map((p) => {
      const customer = custMap.get(p.customerId);
      const schemeCard = cardMap.get(p.schemeCardId);
      return {
        ...p,
        customer,
        schemeCard,
      };
    });

    if (filters?.customerId) {
      payments = payments.filter((p) => p.customerId === filters.customerId);
    }

    if (filters?.schemeCardId) {
      payments = payments.filter((p) => p.schemeCardId === filters.schemeCardId);
    }

    if (filters?.paymentMethod && filters.paymentMethod !== 'ALL') {
      payments = payments.filter((p) => p.paymentMethod === filters.paymentMethod);
    }

    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      payments = payments.filter((p) => {
        const custName = p.customer?.name.toLowerCase() || '';
        const phone = p.customer?.phone.toLowerCase() || '';
        const cardNo = p.schemeCard?.cardNumber.toLowerCase() || '';
        return custName.includes(q) || phone.includes(q) || cardNo.includes(q);
      });
    }

    return payments;
  },

  // DRAWS & WINNERS
  getDraws(): Draw[] {
    const store = ensureDataInitialized();
    const custMap = new Map(store.customers.map((c) => [c._id, c]));
    const cardMap = new Map(store.schemeCards.map((sc) => [sc._id, sc]));

    return store.draws
      .map((draw) => {
        const winners = store.winners
          .filter((w) => w.drawId === draw._id)
          .map((w) => ({
            ...w,
            customer: custMap.get(w.customerId),
            schemeCard: cardMap.get(w.schemeCardId),
          }));
        return {
          ...draw,
          winners,
        };
      })
      .sort((a, b) => a.drawNumber - b.drawNumber);
  },

  getDrawById(id: string): Draw | null {
    const draws = db.getDraws();
    return draws.find((d) => d._id === id) || null;
  },

  createDraw(data: {
    drawNumber: number;
    drawDate: string;
    grandPrize: string;
    additionalPrizes?: string[];
    notes?: string;
  }): Draw {
    const store = ensureDataInitialized();
    const newDraw: Draw = {
      _id: `draw-${Date.now()}`,
      drawNumber: Number(data.drawNumber),
      drawDate: data.drawDate,
      grandPrize: data.grandPrize.trim(),
      additionalPrizes: data.additionalPrizes || [],
      status: 'Upcoming',
      notes: data.notes?.trim() || '',
    };

    store.draws.push(newDraw);
    saveStore(store);
    return newDraw;
  },

  updateDraw(id: string, data: Partial<Draw>): Draw | null {
    const store = ensureDataInitialized();
    const index = store.draws.findIndex((d) => d._id === id);
    if (index === -1) return null;

    store.draws[index] = {
      ...store.draws[index],
      ...data,
      _id: id,
    };

    saveStore(store);
    return store.draws[index];
  },

  recordWinner(data: {
    drawId: string;
    customerId: string;
    schemeCardId: string;
    prize: string;
    winnerInformation?: string;
  }): Winner {
    const store = ensureDataInitialized();
    const draw = store.draws.find((d) => d._id === data.drawId);
    if (!draw) {
      throw new Error('Draw not found.');
    }

    const winnerId = `win-${Date.now()}`;
    const newWinner: Winner = {
      _id: winnerId,
      drawId: data.drawId,
      customerId: data.customerId,
      schemeCardId: data.schemeCardId,
      prize: data.prize.trim(),
      winnerInformation: data.winnerInformation?.trim() || '',
      wonDate: new Date().toISOString(),
    };

    store.winners.push(newWinner);
    draw.status = 'Completed';

    saveStore(store);
    return newWinner;
  },

  // SETTINGS
  getSettings(): Settings {
    const store = ensureDataInitialized();
    return store.settings || initialSettings;
  },

  updateSettings(data: Partial<Settings>): Settings {
    const store = ensureDataInitialized();
    store.settings = {
      ...store.settings,
      ...data,
    };
    saveStore(store);
    return store.settings;
  },

  // DASHBOARD STATISTICS - Memoized for instant response
  getDashboardStats(): {
    stats: DashboardStats;
    recentPayments: Payment[];
    upcomingPayments: Array<{
      customer: Customer;
      schemeCard: SchemeCard;
      dueDate: string;
      dueAmount: number;
      installmentNumber: number;
    }>;
    duePayments: Array<{
      customer: Customer;
      schemeCard: SchemeCard;
      dueDate: string;
      dueAmount: number;
      installmentNumber: number;
      overdueDays: number;
    }>;
    recentCustomers: Customer[];
  } {
    if (cachedDashboard) {
      return cachedDashboard;
    }

    const store = ensureDataInitialized();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalCustomers = store.customers.length;
    const activeSchemeCards = store.schemeCards.filter((sc) => sc.status === 'Active').length;
    const totalCollection = store.payments.reduce((sum, p) => sum + p.amount, 0);

    const thisMonthCollection = store.payments
      .filter((p) => {
        const d = new Date(p.paymentDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    let pendingPaymentsAmount = 0;
    let pendingInstallmentsTotal = 0;

    const duePaymentsList: Array<{
      customer: Customer;
      schemeCard: SchemeCard;
      dueDate: string;
      dueAmount: number;
      installmentNumber: number;
      overdueDays: number;
    }> = [];

    const upcomingPaymentsList: Array<{
      customer: Customer;
      schemeCard: SchemeCard;
      dueDate: string;
      dueAmount: number;
      installmentNumber: number;
    }> = [];

    const custMap = new Map(store.customers.map((c) => [c._id, c]));

    for (const card of store.schemeCards) {
      if (card.status !== 'Active') continue;
      const customer = custMap.get(card.customerId);
      if (!customer) continue;

      const cardInsts = store.installments.filter((i) => i.schemeCardId === card._id);

      for (const inst of cardInsts) {
        const dueDate = new Date(inst.dueDate);
        const unpaid = inst.dueAmount - inst.paidAmount;

        if (unpaid > 0) {
          if (dueDate <= now) {
            pendingPaymentsAmount += unpaid;
            pendingInstallmentsTotal += 1;

            const diffTime = Math.abs(now.getTime() - dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            duePaymentsList.push({
              customer,
              schemeCard: card,
              dueDate: inst.dueDate,
              dueAmount: unpaid,
              installmentNumber: inst.installmentNumber,
              overdueDays: diffDays,
            });
          } else {
            upcomingPaymentsList.push({
              customer,
              schemeCard: card,
              dueDate: inst.dueDate,
              dueAmount: unpaid,
              installmentNumber: inst.installmentNumber,
            });
          }
        }
      }
    }

    upcomingPaymentsList.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    duePaymentsList.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const recentPayments = db.getPayments().slice(0, 5);
    const recentCustomers = db.getCustomers().slice(0, 5);

    cachedDashboard = {
      stats: {
        totalCustomers,
        activeSchemeCards,
        totalCollection,
        thisMonthCollection,
        pendingPaymentsAmount,
        pendingInstallmentsTotal,
      },
      recentPayments,
      upcomingPayments: upcomingPaymentsList.slice(0, 5),
      duePayments: duePaymentsList.slice(0, 5),
      recentCustomers,
    };

    return cachedDashboard;
  },
};
