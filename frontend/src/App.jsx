import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/page/index";
// import { Register } from "./pages/Register";
import Layout from "./layout/index";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import Unit from "./pages/unit/pages/index";
import ProtectedRoute from "./components/ProtectedRoute";
import AddUnit from "./pages/unit/components/AddUnit";
import EditUnit from "./pages/unit/components/EditUnit";
import CateGory from "./pages/category/pages/index";
import AddCate from "./pages/category/components/AddCate";
import EditCate from "./pages/category/components/EditCate";
import Attribute from "./pages/attribute/page/index";
import AddAttribute from "./pages/attribute/components/AddAttribute";
import EditAttribute from "./pages/attribute/components/EditAttribute";
import Product from "./pages/product/pages/index";
import AddProduct from "./pages/product/pages/AddProductPage";
import Customer from "./pages/customer/pages";
import AddCustomer from "./pages/customer/pages/AddCustomer";
import EditCustomer from "./pages/customer/pages/EditCustomer";
import Supplier from "./pages/suppliers/pages/index";
import AddSuplier from "./pages/suppliers/pages/AddSuplier";
import EditSupplier from "./pages/suppliers/pages/EditSupplier";
import { EditProductPage } from "./pages/product/pages/EditProductPage";
import Discount from "./pages/discount/pages/index";
import { AddDiscount } from "./pages/discount/pages/AddDiscount";
import { EditDiscount } from "./pages/discount/pages/EditDiscount";
import Coupon from "./pages/coupon/pages/index";
import AddCoupon from "./pages/coupon/pages/AddCoupon";
import EditCoupon from "./pages/coupon/pages/EditCoupon";
import Order from "./pages/order/pages/index";
import CreateOrder from "./pages/order/pages/CreateOrder";
import EditOrder from "./pages/order/pages/EditOrder";
import Invoice from "./pages/invoice/index";
import DashboardPage from "./pages/revenue";
import Purchase from "./pages/purchase/pages/index";
import ViewPurchaseOrderDetail from "./pages/purchase/pages/DetailPurchase";
import AddPurchaseOrder from "./pages/purchase/pages/AddPurchaseOrder";
import EditPurchaseOrder from "./pages/purchase/pages/EditPurchase";

const Logout = () => {
    localStorage.clear();
    return <Navigate to="/login" />;
};

const RegisterAndLogout = () => {
    localStorage.clear();
    return <Register />;
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute allowedGroups={["Manager", "Saler"]}>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardPage />} />
                    <Route path="products/">
                        <Route
                            index
                            element={
                                <ProtectedRoute>
                                    <Product />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="add/"
                            element={
                                <ProtectedRoute>
                                    <AddProduct />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="edit/:id/"
                            element={
                                <ProtectedRoute>
                                    <EditProductPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="categories/">
                            <Route
                                index
                                element={
                                    <ProtectedRoute
                                        allowedGroups={["Manager", "Saler"]}
                                    >
                                        <CateGory />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="add/"
                                element={
                                    <ProtectedRoute
                                        allowedGroups={["Manager", "Saler"]}
                                    >
                                        <AddCate />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="edit/:id/"
                                element={
                                    <ProtectedRoute
                                        allowedGroups={["Manager", "Saler"]}
                                    >
                                        <EditCate />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>
                        <Route path="attributes/">
                            <Route
                                index
                                element={
                                    <ProtectedRoute
                                        allowedGroups={["Manager", "Saler"]}
                                    >
                                        <Attribute />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="add/"
                                element={
                                    <ProtectedRoute
                                        allowedGroups={["Manager", "Saler"]}
                                    >
                                        <AddAttribute />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="edit/:id/"
                                element={
                                    <ProtectedRoute
                                        allowedGroups={["Manager", "Saler"]}
                                    >
                                        <EditAttribute />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>
                        <Route path="units/">
                            <Route
                                index
                                element={
                                    <ProtectedRoute
                                        allowedGroups={["Manager", "Saler"]}
                                    >
                                        <Unit />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="add/"
                                element={
                                    <ProtectedRoute
                                        allowedGroups={["Manager", "Saler"]}
                                    >
                                        <AddUnit />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="edit/:id/"
                                element={
                                    <ProtectedRoute
                                        allowedGroups={["Manager", "Saler"]}
                                    >
                                        <EditUnit />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>
                    </Route>
                    <Route path="customer/">
                        <Route
                            index
                            element={
                                <ProtectedRoute
                                    allowedGroups={["Manager", "Saler"]}
                                >
                                    <Customer />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="add/"
                            element={
                                <ProtectedRoute
                                    allowedGroups={["Manager", "Saler"]}
                                >
                                    <AddCustomer />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="edit/:id/"
                            element={
                                <ProtectedRoute
                                    allowedGroups={["Manager", "Saler"]}
                                >
                                    <EditCustomer />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                    {/* TODO */}
                    <Route path="supplier/">
                        <Route index element={<Supplier />} />
                        <Route path="add/" element={<AddSuplier />} />
                        <Route path="edit/:id/" element={<EditSupplier />} />
                    </Route>
                    <Route path="promotion/">
                        <Route path="discount/">
                            <Route index element={<Discount />} />
                            <Route path="add/" element={<AddDiscount />} />
                            <Route
                                path="edit/:id/"
                                element={<EditDiscount />}
                            />
                        </Route>
                        <Route path="coupon/">
                            <Route index element={<Coupon />} />
                            <Route path="add/" element={<AddCoupon />} />
                            <Route path="edit/:id/" element={<EditCoupon />} />
                        </Route>
                    </Route>
                    <Route path="employee/">
                        <Route index element={<div>List Employee</div>} />
                        <Route path="add/" element={<div>Add Employee</div>} />
                        <Route
                            path="edit/:id/"
                            element={<div>Edit Employee</div>}
                        />
                    </Route>
                    <Route path="orders">
                        <Route index element={<Order />} />
                        <Route path="add/" element={<CreateOrder />} />
                        <Route path="edit/:id/" element={<EditOrder />} />
                    </Route>
                    <Route path="purchase">
                        <Route index element={<Purchase />} />
                        <Route path="add/" element={<AddPurchaseOrder />} />
                        <Route
                            path="edit/:id/"
                            element={<EditPurchaseOrder />}
                        />
                    </Route>
                    <Route path="invoice">
                        <Route index element={<Invoice />} />
                    </Route>
                    {/* TODO */}
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                {/* <Route path="/register" element={<RegisterAndLogout />} /> */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
