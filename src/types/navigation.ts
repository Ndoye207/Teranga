import { Vendor } from './index';

export type RootStackParamList = {
  Selection: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Client: undefined;
  Vendor: undefined;
  Livreur: undefined;
  Admin: undefined;
};

export type ClientStackParamList = {
  Home: undefined;
  Vendor: { vendor: Vendor };
};

// Pile racine du client : les onglets + les écrans qui doivent s'ouvrir par-dessus (notation)
export type ClientRootParamList = {
  ClientTabs: undefined;
  OrderHistory: undefined;
  Rating: { order: { id: string; vendorName?: string; hasLivreur?: boolean } };
};

export type VendorStackParamList = {
  Main: undefined;
  CreateShop: undefined;
  AddProduct: { vendorId?: string; product?: any };
  AccountSettings: undefined;
  ShopSettings: undefined;
};

export type LivreurStackParamList = {
  MainTabs: undefined;
  CourseDetail: { course: any };
  CreateCourier: undefined;
  CourierSettings: undefined;
};

export type LivreurTabParamList = {
  Disponible: undefined;
  CoursesTab: undefined;
  Revenus: undefined;
};

export type ClientTabParamList = {
  Accueil: undefined;
  CartTab: undefined;
  TrackingTab: undefined;
};