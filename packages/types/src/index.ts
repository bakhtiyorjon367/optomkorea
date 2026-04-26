export interface IHealthCheck {
  ok: boolean;
}

export interface IAuthUser {
  id: string;
  role: 'admin' | 'manager' | 'user';
  firstName: string;
  lastName?: string;
  username?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  createdAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  costKrw: number;
  sellingPrice: number;
  totalAvail: number;
  /** Denormalized sum of manager_products.quantityReceived. */
  totalReceived?: number;
  /** Sum of quantityTotal across all shipments for this product. */
  totalShipped?: number;
  /** Count of shipment documents for this product. */
  shippedCount?: number;
  /** Units sold (sum of sale line quantities); may be live-computed on read. */
  soldCount?: number;
  /** Full image URLs; API may store `/uploads/products/{id}.webp` with a matching `{id}_thumb.webp` on disk. */
  images: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Product fields returned on admin shipment list (subset). */
export type IShipmentProductSummary = Pick<IProduct, 'name' | 'images'> & {
  totalShipped: number;
  shippedCount: number;
};

export interface IShipment {
  _id: string;
  productId: string;
  product?: IShipmentProductSummary;
  quantityTotal: number;
  quantityDistributed: number;
  quantityRemaining?: number;
  costKrwTotal: number;
  shippedAt: string;
  notes: string;
  createdAt: string;
}

export interface IReceipt {
  _id: string;
  shipmentId: string;
  shipment?: IShipment;
  managerId: string;
  manager?: IUser;
  productId: string;
  product?: IProduct;
  quantity: number;
  receivedAt: string;
}

export interface IManagerProduct {
  _id: string;
  productId: string;
  product?: IProduct;
  managerId: string;
  manager?: IUser;
  /** Includes shipment receipts and confirmed inbound transfers. */
  quantityReceived: number;
  quantityAvail: number;
  createdAt: string;
  updatedAt: string;
}

export interface ISale {
  _id: string;
  type: 'cash' | 'credit';
  managerId: string;
  manager?: IUser;
  buyerName: string;
  comment: string;
  status: 'paid' | 'unpaid';
  totalAmount: number;
  amountPaid: number;
  /** Number of line items (sale_items) for this sale. */
  itemCount?: number;
  items?: ISaleItem[];
  createdAt: string;
}

export interface ISaleItem {
  _id: string;
  saleId: string;
  productId: string;
  product?: IProduct;
  quantity: number;
  price: number;
  createdAt: string;
}

export interface IStockTransfer {
  _id: string;
  fromManagerId: string;
  fromManager?: IUser;
  toManagerId: string;
  toManager?: IUser;
  productId: string;
  product?: IProduct;
  quantity: number;
  status: 'pending' | 'confirmed';
  initiatedAt: string;
  confirmedAt: string | null;
}

export interface IUser {
  _id: string;
  username: string;
  firstName: string;
  lastName?: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string;
}

export interface IFinanceTransaction {
  _id: string;
  type: 'admin_gave' | 'manager_paid';
  managerId: string;
  manager?: IUser;
  amount: number;
  note: string;
  transactionDate: string;
  recordedBy: string;
  createdAt: string;
}

export interface IFinanceBalance {
  managerId: string;
  manager?: IUser;
  totalGiven: number;
  totalReceived: number;
  net: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface IApiResponse<T> {
  data: T;
}
