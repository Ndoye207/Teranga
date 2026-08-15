import { Vendor, Order } from './index';

export type RootStackParamList = {
  Selection: undefined;
  Login: undefined;
  Register: undefined;
  Client: undefined;
  Vendor: undefined;
  Livreur: undefined;
  Admin: undefined;
};

export type ClientStackParamList = {
  Home: undefined;
  Vendor: { vendor: Vendor };
  Rating: { order: Order };
};

export type VendorStackParamList = {
  Products: undefined;
  Orders: undefined;
  CreateShop: undefined;
  AddProduct: { vendorId: string };
  AccountSettings: undefined;
  ShopSettings: undefined;
};

export type LivreurStackParamList = {
  Courses: undefined;
  CourseDetail: { courseId: string };
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
