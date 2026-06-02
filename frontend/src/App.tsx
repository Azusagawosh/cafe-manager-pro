import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, message, Layout, Menu, Table, Modal, Form, Space, Tag, Statistic, Row, Col, InputNumber, Radio, Drawer, List, Avatar, Badge, Dropdown, Input, DatePicker, Select, Progress, Tabs, Popconfirm } from 'antd';
import { 
  CoffeeOutlined, ShoppingCartOutlined, LoginOutlined, LogoutOutlined, 
  PlusOutlined, DollarOutlined, OrderedListOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, ClockCircleOutlined, CarOutlined, UserOutlined, 
  DeleteOutlined, ShoppingOutlined, DashboardOutlined, BarChartOutlined, 
  AppstoreOutlined, TeamOutlined, SettingOutlined, StarOutlined, ExportOutlined 
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const API_URL = 'http://localhost:8080/api';

interface CartItem {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface StaffMember {
  id: number;
  name: string;
  role: string;
  phone: string;
  salary: number;
  hours: number;
}

interface WarehouseItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [form] = Form.useForm();
  const [orderType, setOrderType] = useState('dine_in');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, activeOrders: 0 });
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>({ daily: [], topProducts: [], categoryRevenue: {} });
  
  // Warehouse state
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [isWarehouseModalVisible, setIsWarehouseModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [warehouseForm] = Form.useForm();
  
  // Staff state
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isStaffModalVisible, setIsStaffModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffForm] = Form.useForm();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      loadProducts();
      loadOrders();
      loadStats();
      loadWarehouseData();
      loadStaffData();
      loadAnalyticsData();
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      setIsLoggedIn(true);
      message.success('Қош келдіңіз!');
      loadProducts();
      loadOrders();
      loadStats();
      loadWarehouseData();
      loadStaffData();
      loadAnalyticsData();
    } catch (err) {
      message.error('Кіру қатесі');
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data);
      loadAnalyticsData();
    } catch (err) {
      console.error(err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      const ordersData = res.data;
      const total = ordersData.reduce((sum: number, order: any) => sum + order.total_amount, 0);
      const active = ordersData.filter((order: any) => order.status === 'pending').length;
      setStats({ totalOrders: ordersData.length, totalRevenue: total, activeOrders: active });
    } catch (err) {
      console.error(err);
    }
  };
  
  // Warehouse functions
  const loadWarehouseData = () => {
    const mockWarehouse: WarehouseItem[] = [
      { id: 1, name: 'Кофе зерна', category: 'Напитки', quantity: 15, unit: 'кг', min_quantity: 5 },
      { id: 2, name: 'Чай листовой', category: 'Напитки', quantity: 8, unit: 'кг', min_quantity: 3 },
      { id: 3, name: 'Молоко', category: 'Напитки', quantity: 25, unit: 'л', min_quantity: 10 },
      { id: 4, name: 'Сливки', category: 'Напитки', quantity: 10, unit: 'л', min_quantity: 5 },
      { id: 5, name: 'Мука', category: 'Выпечка', quantity: 30, unit: 'кг', min_quantity: 10 },
      { id: 6, name: 'Сахар', category: 'Бакалея', quantity: 20, unit: 'кг', min_quantity: 5 },
      { id: 7, name: 'Масло сливочное', category: 'Бакалея', quantity: 5, unit: 'кг', min_quantity: 2 },
      { id: 8, name: 'Яйца', category: 'Бакалея', quantity: 120, unit: 'шт', min_quantity: 50 },
      { id: 9, name: 'Сыр', category: 'Бакалея', quantity: 8, unit: 'кг', min_quantity: 3 },
      { id: 10, name: 'Фрукты', category: 'Фрукты', quantity: 12, unit: 'кг', min_quantity: 5 },
    ];
    setWarehouseItems(mockWarehouse);
  };
  
  // Staff functions
  const loadStaffData = () => {
    const mockStaff: StaffMember[] = [
      { id: 1, name: 'Айдос', role: 'Аға даяшы', phone: '+7 777 123 45 67', salary: 250000, hours: 160 },
      { id: 2, name: 'Меруерт', role: 'Даяшы', phone: '+7 777 234 56 78', salary: 200000, hours: 160 },
      { id: 3, name: 'Дамир', role: 'Бариста', phone: '+7 777 345 67 89', salary: 230000, hours: 160 },
      { id: 4, name: 'Айгерим', role: 'Аспаз', phone: '+7 777 456 78 90', salary: 280000, hours: 160 },
      { id: 5, name: 'Ерлан', role: 'Курьер', phone: '+7 777 567 89 01', salary: 180000, hours: 140 },
    ];
    setStaffList(mockStaff);
  };
  
  // Analytics functions
  const loadAnalyticsData = () => {
    const categoryRevenue: any = { 'Кофе': 0, 'Чай': 0, 'Десерты': 0, 'Завтраки': 0, 'Сэндвичи': 0 };
    orders.forEach(order => {
      const categories = ['Кофе', 'Чай', 'Десерты', 'Завтраки', 'Сэндвичи'];
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      categoryRevenue[randomCat] += order.total_amount * 0.2;
    });
    
    setAnalyticsData({
      daily: [
        { date: '2024-06-01', total: 12500, orders: 5 },
        { date: '2024-06-02', total: 18900, orders: 8 },
        { date: '2024-06-03', total: 15200, orders: 6 },
        { date: '2024-06-04', total: 22100, orders: 9 },
        { date: '2024-06-05', total: 17800, orders: 7 },
        { date: '2024-06-06', total: 25600, orders: 11 },
        { date: '2024-06-07', total: 31000, orders: 14 },
      ],
      topProducts: [
        { name: '☕ Капучино', count: 45, revenue: 76500 },
        { name: '☕ Латте', count: 38, revenue: 72200 },
        { name: '🍰 Тирамису', count: 25, revenue: 67500 },
        { name: '🥪 Сэндвич с курицей', count: 20, revenue: 72000 },
        { name: '🍵 Чай с жасмином', count: 18, revenue: 28800 },
      ],
      categoryRevenue: categoryRevenue
    });
  };
  
  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/status`, { status });
      const statusText = status === 'paid' ? 'төленді' : 'болдырылды';
      message.success(`Тапсырыс ${statusText}`);
      loadOrders();
      loadStats();
    } catch (err) {
      message.error('Статусты өзгерту қатесі');
    }
  };

  const addToCart = (product: any) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    message.success(`${product.name} себетке қосылды`);
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart => prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const createOrder = async (values: any) => {
    if (cart.length === 0) {
      message.error('Кем дегенде бір тауар қосыңыз');
      return;
    }

    const orderData = {
      table_id: orderType === 'dine_in' ? Number(values.table_id) : 0,
      total_amount: getCartTotal(),
      order_type: orderType,
      people_count: orderType === 'dine_in' ? Number(values.people_count) : 1,
      comment: values.comment || '',
      courier_name: orderType === 'courier' ? values.courier_name : null,
      customer_name: orderType !== 'dine_in' ? values.customer_name : null,
      customer_phone: orderType !== 'dine_in' ? values.customer_phone : null,
    };
    
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData);
      if (response.data.success) {
        message.success(`Тапсырыс жасалды! Сомасы: ${getCartTotal()} ₸`);
        setCart([]);
        setIsModalVisible(false);
        setIsCartVisible(false);
        form.resetFields();
        setOrderType('dine_in');
        loadOrders();
        loadStats();
        loadAnalyticsData();
      }
    } catch (err) {
      message.error('Тапсырыс жасау қатесі');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <Card className="w-96 shadow-2xl rounded-xl">
          <div className="text-center mb-6">
            <CoffeeOutlined className="text-6xl text-purple-600" />
            <h1 className="text-2xl font-bold mt-2 text-gray-800">Cafe Manager Pro</h1>
            <p className="text-gray-500">Кафе басқару жүйесі</p>
          </div>
          <Input 
            placeholder="Логин" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3"
            size="large"
          />
          <Input.Password 
            placeholder="Құпия сөз" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="mb-3"
            size="large"
          />
          <Button 
            type="primary" 
            onClick={handleLogin} 
            block 
            size="large"
            icon={<LoginOutlined />}
            className="bg-purple-600"
          >
            Кіру
          </Button>
          <div className="text-center mt-4 text-gray-400 text-sm">
            <p>Кіру деректері: admin / admin123</p>
          </div>
        </Card>
      </div>
    );
  }

  // Dashboard Component
  const DashboardPage = () => {
    const productColumns = [
      { title: 'Атауы', dataIndex: 'name', key: 'name' },
      { title: 'Бағасы', dataIndex: 'price', key: 'price', render: (price: number) => <Tag color="green">{price} ₸</Tag> },
      { title: 'Санаты', dataIndex: 'category', key: 'category', render: (cat: string) => <Tag color="blue">{cat}</Tag> },
      { 
        title: '', 
        key: 'action', 
        render: (_: any, record: any) => (
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => addToCart(record)}>
            Қосу
          </Button>
        )
      },
    ];

    const orderColumns = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
      { title: 'Түрі', dataIndex: 'order_type', key: 'order_type', render: (type: string) => {
        const types: any = { dine_in: '🏠 Залда', takeaway: '📦 Өзімен', courier: '🚚 Жеткізу' };
        return types[type] || type;
      }},
      { title: 'Ақпарат', key: 'info', render: (_: any, r: any) => {
        if (r.order_type === 'dine_in') return `Үстел ${r.table_id} (${r.people_count} адам)`;
        return r.customer_name || '-';
      }},
      { title: 'Сомасы', dataIndex: 'total_amount', render: (v: number) => <b>{v} ₸</b> },
      { 
        title: 'Статусы', 
        dataIndex: 'status', 
        key: 'status', 
        render: (status: string, record: any) => {
          const statusColors: any = { pending: 'orange', paid: 'green', cancelled: 'red' };
          const statusTexts: any = { pending: 'Өңделуде', paid: 'Төленді', cancelled: 'Болдырылды' };
          return (
            <Dropdown
              menu={{
                items: [
                  { key: 'paid', label: 'Төленді', icon: <CheckCircleOutlined />, onClick: () => updateOrderStatus(record.id, 'paid') },
                  { key: 'cancelled', label: 'Болдырылды', icon: <CloseCircleOutlined />, onClick: () => updateOrderStatus(record.id, 'cancelled') }
                ]
              }}
              trigger={['click']}
            >
              <Tag color={statusColors[status]} style={{ cursor: 'pointer' }}>
                {statusTexts[status]} ▼
              </Tag>
            </Dropdown>
          );
        }
      },
      { title: 'Пікір', dataIndex: 'comment', key: 'comment', width: 200, render: (t: string) => t?.split('\n')[0] || '-' },
      { title: 'Уақыты', dataIndex: 'created_at', render: (d: string) => d ? new Date(d).toLocaleString() : '-' },
    ];

    const grouped = products.reduce((acc: any, p: any) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {});

    const categoryOrder = ['Кофе', 'Чай', 'Холодные напитки', 'Десерты', 'Завтраки', 'Сэндвичи', 'Снэки'];
    const categoryIcons: any = {
      'Кофе': '☕', 'Чай': '🍵', 'Холодные напитки': '🥤', 'Десерты': '🍰', 'Завтраки': '🍳', 'Сэндвичи': '🥪', 'Снэки': '🍟'
    };

    return (
      <>
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={8}>
            <Card><Statistic title="Барлық тапсырыс" value={stats.totalOrders} prefix={<OrderedListOutlined />} /></Card>
          </Col>
          <Col span={8}>
            <Card><Statistic title="Табыс" value={stats.totalRevenue} prefix={<DollarOutlined />} suffix="₸" valueStyle={{ color: '#3f8600' }} /></Card>
          </Col>
          <Col span={8}>
            <Card><Statistic title="Белсенді тапсырыстар" value={stats.activeOrders} prefix={<ClockCircleOutlined />} /></Card>
          </Col>
        </Row>
        
        <Card 
          title="📋 Біздің мәзір" 
          className="mb-6" 
          extra={<Button type="primary" icon={<ShoppingOutlined />} onClick={() => setIsCartVisible(true)}>Себет ({cart.length})</Button>}
        >
          {categoryOrder.map(category => {
            if (!grouped[category]) return null;
            return (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{categoryIcons[category]} {category} ({grouped[category].length})</h3>
                <Table dataSource={grouped[category]} columns={productColumns} rowKey="id" pagination={false} size="small" />
              </div>
            );
          })}
        </Card>
        
        <Card title="🛒 Тапсырыстар тарихы">
          <Table dataSource={orders} columns={orderColumns} rowKey="id" scroll={{ x: 1000 }} />
        </Card>
      </>
    );
  };

  // Analytics Page
  const AnalyticsPage = () => {
    const topProductsColumns = [
      { title: 'Өнім атауы', dataIndex: 'name', key: 'name' },
      { title: 'Сатылым саны', dataIndex: 'count', key: 'count', render: (v: number) => <Tag color="blue">{v} дана</Tag> },
      { title: 'Табыс', dataIndex: 'revenue', key: 'revenue', render: (v: number) => <b>{v} ₸</b> },
    ];

    const dailyColumns = [
      { title: 'Күні', dataIndex: 'date', key: 'date' },
      { title: 'Тапсырыс саны', dataIndex: 'orders', key: 'orders', render: (v: number) => <Tag color="cyan">{v}</Tag> },
      { title: 'Табыс', dataIndex: 'total', key: 'total', render: (v: number) => <b className="text-green-600">{v} ₸</b> },
    ];

    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">📊 Аналитика</h2>
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={6}>
            <Card><Statistic title="Орташа чек" value={stats.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders) : 0} prefix="₸" /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="Күндік табыс" value={analyticsData.daily[analyticsData.daily.length-1]?.total || 0} prefix="₸" suffix="/күн" /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="Өнімдер саны" value={products.length} suffix="дана" /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="Қайталану коэффициенті" value={stats.totalOrders ? ((stats.totalOrders - stats.activeOrders) / stats.totalOrders * 100).toFixed(0) : 0} suffix="%" /></Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={14}>
            <Card title="📈 Күндік табыс динамикасы">
              <Table dataSource={analyticsData.daily} columns={dailyColumns} rowKey="date" pagination={false} size="small" />
            </Card>
          </Col>
          <Col span={10}>
            <Card title="🏆 Ең танымал өнімдер">
              <Table dataSource={analyticsData.topProducts} columns={topProductsColumns} rowKey="name" pagination={false} size="small" />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-6">
          <Col span={24}>
            <Card title="💰 Санаттар бойынша табыс">
              <Row gutter={[16, 16]}>
                {Object.entries(analyticsData.categoryRevenue).map(([cat, revenue]: [string, any]) => (
                  <Col span={4} key={cat}>
                    <Card size="small">
                      <div className="text-center">
                        <div className="text-lg font-bold">{cat}</div>
                        <div className="text-green-600">{Math.round(revenue)} ₸</div>
                        <Progress percent={Math.round(revenue / stats.totalRevenue * 100)} size="small" />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Warehouse Page
  const WarehousePage = () => {
    const handleSaveItem = (values: any) => {
      if (editingItem) {
        setWarehouseItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...values } : item));
        message.success('Өнім жаңартылды');
      } else {
        const newItem = { ...values, id: Date.now() };
        setWarehouseItems(prev => [...prev, newItem]);
        message.success('Өнім қосылды');
      }
      setIsWarehouseModalVisible(false);
      warehouseForm.resetFields();
      setEditingItem(null);
    };

    const handleDeleteItem = (id: number) => {
      setWarehouseItems(prev => prev.filter(item => item.id !== id));
      message.success('Өнім жойылды');
    };

    const warehouseColumns = [
      { title: 'Өнім атауы', dataIndex: 'name', key: 'name' },
      { title: 'Санаты', dataIndex: 'category', key: 'category', render: (cat: string) => <Tag color="purple">{cat}</Tag> },
      { title: 'Саны', key: 'quantity', render: (_: any, record: WarehouseItem) => (
        <span className={record.quantity < record.min_quantity ? 'text-red-500 font-bold' : ''}>
          {record.quantity} {record.unit}
          {record.quantity < record.min_quantity && <Tag color="red" className="ml-2">Аз қалды!</Tag>}
        </span>
      )},
      { title: 'Ең төменгі норма', dataIndex: 'min_quantity', render: (v: number, record: WarehouseItem) => `${v} ${record.unit}` },
      { 
        title: 'Әрекет', 
        key: 'action', 
        render: (_: any, record: WarehouseItem) => (
          <Space>
            <Button size="small" onClick={() => { setEditingItem(record); warehouseForm.setFieldsValue(record); setIsWarehouseModalVisible(true); }}>✏️ Өңдеу</Button>
            <Popconfirm title="Жою?" onConfirm={() => handleDeleteItem(record.id)}>
              <Button size="small" danger>🗑️ Жою</Button>
            </Popconfirm>
          </Space>
        )
      },
    ];

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📦 Қойма</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); warehouseForm.resetFields(); setIsWarehouseModalVisible(true); }}>
            Жаңа өнім
          </Button>
        </div>
        
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={6}><Card><Statistic title="Жалпы өнімдер" value={warehouseItems.length} suffix="дана" /></Card></Col>
          <Col span={6}><Card><Statistic title="Аз қалған өнімдер" value={warehouseItems.filter(i => i.quantity < i.min_quantity).length} suffix="дана" valueStyle={{ color: '#cf1322' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="Жалпы салмақ/көлем" value={warehouseItems.reduce((sum, i) => sum + i.quantity, 0)} suffix="бірлік" /></Card></Col>
          <Col span={6}><Card><Statistic title="Қойма құны" value={warehouseItems.reduce((sum, i) => sum + i.quantity * 1000, 0)} prefix="₸" suffix="(шамамен)" /></Card></Col>
        </Row>

        <Card title="Қоймадағы өнімдер">
          <Table dataSource={warehouseItems} columns={warehouseColumns} rowKey="id" />
        </Card>

        <Modal title={editingItem ? "Өнімді өңдеу" : "Жаңа өнім қосу"} open={isWarehouseModalVisible} onCancel={() => { setIsWarehouseModalVisible(false); warehouseForm.resetFields(); setEditingItem(null); }} footer={null}>
          <Form form={warehouseForm} onFinish={handleSaveItem} layout="vertical">
            <Form.Item name="name" label="Өнім атауы" rules={[{ required: true }]}>
              <Input placeholder="Мысалы: Кофе зерна" />
            </Form.Item>
            <Form.Item name="category" label="Санаты" rules={[{ required: true }]}>
              <Select placeholder="Санатты таңдаңыз">
                <Option value="Напитки">Напитки</Option>
                <Option value="Бакалея">Бакалея</Option>
                <Option value="Выпечка">Выпечка</Option>
                <Option value="Фрукты">Фрукты</Option>
                <Option value="Овощи">Овощи</Option>
              </Select>
            </Form.Item>
            <Form.Item name="quantity" label="Саны" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="unit" label="Өлшем бірлігі">
              <Select placeholder="Өлшем бірлігі">
                <Option value="кг">кг</Option>
                <Option value="л">л</Option>
                <Option value="шт">шт</Option>
                <Option value="гр">гр</Option>
              </Select>
            </Form.Item>
            <Form.Item name="min_quantity" label="Ең төменгі норма">
              <InputNumber min={0} className="w-full" placeholder="Ескерту көрсетілетін шек" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>Сақтау</Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  // Staff Page
  const StaffPage = () => {
    const handleSaveStaff = (values: any) => {
      if (editingStaff) {
        setStaffList(prev => prev.map(item => item.id === editingStaff.id ? { ...item, ...values } : item));
        message.success('Қызметкер жаңартылды');
      } else {
        const newStaff = { ...values, id: Date.now() };
        setStaffList(prev => [...prev, newStaff]);
        message.success('Қызметкер қосылды');
      }
      setIsStaffModalVisible(false);
      staffForm.resetFields();
      setEditingStaff(null);
    };

    const handleDeleteStaff = (id: number) => {
      setStaffList(prev => prev.filter(item => item.id !== id));
      message.success('Қызметкер жойылды');
    };

    const staffColumns = [
      { title: 'Аты-жөні', dataIndex: 'name', key: 'name' },
      { title: 'Лауазымы', dataIndex: 'role', key: 'role', render: (role: string) => <Tag color="cyan">{role}</Tag> },
      { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
      { title: 'Жалақы', dataIndex: 'salary', key: 'salary', render: (salary: number) => <b>{salary.toLocaleString()} ₸</b> },
      { title: 'Жұмыс сағаты', dataIndex: 'hours', key: 'hours', render: (hours: number) => `${hours} сағ/ай` },
      { 
        title: 'Әрекет', 
        key: 'action', 
        render: (_: any, record: StaffMember) => (
          <Space>
            <Button size="small" onClick={() => { setEditingStaff(record); staffForm.setFieldsValue(record); setIsStaffModalVisible(true); }}>✏️ Өңдеу</Button>
            <Popconfirm title="Жою?" onConfirm={() => handleDeleteStaff(record.id)}>
              <Button size="small" danger>🗑️ Жою</Button>
            </Popconfirm>
          </Space>
        )
      },
    ];

    const totalSalary = staffList.reduce((sum, s) => sum + s.salary, 0);

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">👥 Қызметкерлер</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingStaff(null); staffForm.resetFields(); setIsStaffModalVisible(true); }}>
            Жаңа қызметкер
          </Button>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col span={8}><Card><Statistic title="Қызметкерлер саны" value={staffList.length} suffix="адам" /></Card></Col>
          <Col span={8}><Card><Statistic title="Айлық жалақы" value={totalSalary} prefix="₸" valueStyle={{ color: '#3f8600' }} /></Card></Col>
          <Col span={8}><Card><Statistic title="Орташа жалақы" value={staffList.length ? Math.round(totalSalary / staffList.length) : 0} prefix="₸" /></Card></Col>
        </Row>

        <Card title="Қызметкерлер тізімі">
          <Table dataSource={staffList} columns={staffColumns} rowKey="id" />
        </Card>

        <Modal title={editingStaff ? "Қызметкерді өңдеу" : "Жаңа қызметкер қосу"} open={isStaffModalVisible} onCancel={() => { setIsStaffModalVisible(false); staffForm.resetFields(); setEditingStaff(null); }} footer={null}>
          <Form form={staffForm} onFinish={handleSaveStaff} layout="vertical">
            <Form.Item name="name" label="Аты-жөні" rules={[{ required: true }]}>
              <Input placeholder="Мысалы: Айдос" />
            </Form.Item>
            <Form.Item name="role" label="Лауазымы" rules={[{ required: true }]}>
              <Select placeholder="Лауазымды таңдаңыз">
                <Option value="Аға даяшы">Аға даяшы</Option>
                <Option value="Даяшы">Даяшы</Option>
                <Option value="Бариста">Бариста</Option>
                <Option value="Аспаз">Аспаз</Option>
                <Option value="Курьер">Курьер</Option>
                <Option value="Администратор">Администратор</Option>
                <Option value="Бухгалтер">Бухгалтер</Option>
              </Select>
            </Form.Item>
            <Form.Item name="phone" label="Телефон">
              <Input placeholder="+7 777 123 45 67" />
            </Form.Item>
            <Form.Item name="salary" label="Жалақы (₸)" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" placeholder="150000" />
            </Form.Item>
            <Form.Item name="hours" label="Жұмыс сағаты (айына)">
              <InputNumber min={0} max={200} className="w-full" placeholder="160" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>Сақтау</Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  const cartTotal = getCartTotal();

  return (
    <Layout className="min-h-screen">
      <Header className="bg-gradient-to-r from-purple-700 to-purple-900 flex justify-between items-center px-6">
        <div className="flex items-center text-white">
          <CoffeeOutlined className="text-2xl mr-2" />
          <span className="text-xl font-bold" style={{ color: 'white' }}>Cafe Manager Pro</span>
        </div>
        <Space>
          <Badge count={cart.length} offset={[10, 0]}>
            <Button icon={<ShoppingOutlined />} onClick={() => setIsCartVisible(true)}>
              Себет
            </Button>
          </Badge>
          <Tag color="gold">👤 {JSON.parse(localStorage.getItem('user') || '{}').username}</Tag>
          <Button icon={<LogoutOutlined />} onClick={() => { localStorage.clear(); setIsLoggedIn(false); message.success('Шығу аяқталды'); }}>
            Шығу
          </Button>
        </Space>
      </Header>
      <Layout>
        <Sider theme="light" width={250}>
          <Menu mode="inline" defaultSelectedKeys={['dashboard']} selectedKeys={[activeMenu]} onClick={(e) => setActiveMenu(e.key)} className="h-full">
            <Menu.Item key="dashboard" icon={<DashboardOutlined />}>Басты бет</Menu.Item>
            <Menu.Item key="analytics" icon={<BarChartOutlined />}>Аналитика 📊</Menu.Item>
            <Menu.Item key="warehouse" icon={<AppstoreOutlined />}>Қойма 📦</Menu.Item>
            <Menu.Item key="staff" icon={<TeamOutlined />}>Қызметкерлер 👥</Menu.Item>
          </Menu>
        </Sider>
        <Content className="p-6 bg-gray-50">
          {activeMenu === 'dashboard' && <DashboardPage />}
          {activeMenu === 'analytics' && <AnalyticsPage />}
          {activeMenu === 'warehouse' && <WarehousePage />}
          {activeMenu === 'staff' && <StaffPage />}
        </Content>
      </Layout>

      <Drawer title="🛒 Тапсырыс себеті" placement="right" open={isCartVisible} onClose={() => setIsCartVisible(false)} width={400}>
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Себет бос</div>
        ) : (
          <>
            <List
              dataSource={cart}
              renderItem={(item: CartItem) => (
                <List.Item
                  actions={[
                    <InputNumber key="quantity" min={1} value={item.quantity} onChange={(val) => updateQuantity(item.id, val || 1)} size="small" style={{ width: 60 }} />,
                    <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.id)} />
                  ]}
                >
                  <List.Item.Meta avatar={<Avatar icon={<CoffeeOutlined />} />} title={item.name} description={`${item.price} ₸ x ${item.quantity} = ${item.price * item.quantity} ₸`} />
                </List.Item>
              )}
            />
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="text-lg font-bold">Барлығы:</span>
                <span className="text-xl font-bold text-green-600">{cartTotal} ₸</span>
              </div>
              <Button type="primary" block size="large" onClick={() => { setIsCartVisible(false); setIsModalVisible(true); }}>
                Тапсырыс беру
              </Button>
            </div>
          </>
        )}
      </Drawer>

      <Modal title="Тапсырыс беру" open={isModalVisible} onCancel={() => { setIsModalVisible(false); form.resetFields(); }} footer={null} width={500}>
        <Form form={form} onFinish={createOrder} layout="vertical">
          <Form.Item label="Тапсырыс түрі" required>
            <Radio.Group value={orderType} onChange={(e) => setOrderType(e.target.value)} buttonStyle="solid">
              <Radio.Button value="dine_in">🏠 Залда</Radio.Button>
              <Radio.Button value="takeaway">📦 Өзімен</Radio.Button>
              <Radio.Button value="courier">🚚 Жеткізу</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {orderType === 'dine_in' && (
            <>
              <Form.Item name="table_id" label="Үстел нөмірі" rules={[{ required: true, message: 'Үстел нөмірін енгізіңіз' }]}>
                <InputNumber min={1} max={50} className="w-full" placeholder="Мысалы: 5" />
              </Form.Item>
              <Form.Item name="people_count" label="Қонақтар саны" rules={[{ required: true, message: 'Қонақтар санын көрсетіңіз' }]}>
                <InputNumber min={1} max={20} className="w-full" placeholder="Неше адам?" />
              </Form.Item>
            </>
          )}

          {orderType !== 'dine_in' && (
            <>
              <Form.Item name="customer_name" label="Клиент аты" rules={[{ required: true, message: 'Атыңызды енгізіңіз' }]}>
                <Input prefix={<UserOutlined />} placeholder="Клиент аты" />
              </Form.Item>
              <Form.Item name="customer_phone" label="Телефон">
                <Input placeholder="+7 XXX XXX XX XX" />
              </Form.Item>
            </>
          )}

          {orderType === 'courier' && (
            <Form.Item name="courier_name" label="Курьер аты">
              <Input prefix={<CarOutlined />} placeholder="Курьер аты" />
            </Form.Item>
          )}

          <Form.Item name="comment" label="Пікір">
            <TextArea rows={3} placeholder="Ерекше талаптар, аллергиялар..." />
          </Form.Item>

          <div className="bg-gray-100 p-3 rounded mb-4">
            <div className="font-bold mb-2">🍽️ Тапсырыс құрамы:</div>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span>{item.name} x {item.quantity}</span>
                <span>{item.price * item.quantity} ₸</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
              <span>Барлығы:</span>
              <span className="text-green-600 text-lg">{cartTotal} ₸</span>
            </div>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              ✅ {cartTotal} ₸ -ға тапсырыс беру
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App;