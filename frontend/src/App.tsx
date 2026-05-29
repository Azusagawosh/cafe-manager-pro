import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, message, Layout, Menu, Table, Modal, Form, Space, Tag, Statistic, Row, Col, InputNumber, Radio, Drawer, List, Avatar, Badge, Dropdown, Input } from 'antd';
import { 
  CoffeeOutlined, ShoppingCartOutlined, LoginOutlined, LogoutOutlined, 
  PlusOutlined, DollarOutlined, OrderedListOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, ClockCircleOutlined, CarOutlined, UserOutlined, 
  DeleteOutlined, ShoppingOutlined 
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const API_URL = 'http://localhost:8080/api';

interface CartItem {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      loadProducts();
      loadOrders();
      loadStats();
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      setIsLoggedIn(true);
      message.success('Добро пожаловать!');
      loadProducts();
      loadOrders();
      loadStats();
    } catch (err) {
      message.error('Ошибка входа');
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

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/status`, { status });
      message.success(`Заказ ${status === 'paid' ? 'оплачен' : 'отменен'}`);
      loadOrders();
      loadStats();
    } catch (err) {
      message.error('Ошибка обновления статуса');
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
    message.success(`${product.name} добавлен в корзину`);
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
      message.error('Добавьте хотя бы один товар в заказ');
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
        message.success(`Заказ создан! Сумма: ${getCartTotal()} ₸`);
        setCart([]);
        setIsModalVisible(false);
        setIsCartVisible(false);
        form.resetFields();
        setOrderType('dine_in');
        loadOrders();
        loadStats();
      }
    } catch (err) {
      message.error('Ошибка создания заказа');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <Card className="w-96 shadow-2xl rounded-xl">
          <div className="text-center mb-6">
            <CoffeeOutlined className="text-6xl text-purple-600" />
            <h1 className="text-2xl font-bold mt-2 text-gray-800">Cafe Management</h1>
            <p className="text-gray-500">Система управления кафе</p>
          </div>
          <Input placeholder="Логин" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-3" size="large" />
          <Input.Password placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-3" size="large" />
          <Button type="primary" onClick={handleLogin} block size="large" icon={<LoginOutlined />}>Войти</Button>
          <div className="text-center mt-4 text-gray-400 text-sm">admin / admin123</div>
        </Card>
      </div>
    );
  }

  const productColumns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Цена', dataIndex: 'price', key: 'price', render: (price: number) => <Tag color="green">{price} ₸</Tag> },
    { title: 'Категория', dataIndex: 'category', key: 'category', render: (cat: string) => <Tag color="blue">{cat}</Tag> },
    { 
      title: '', 
      key: 'action', 
      render: (_: any, record: any) => (
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => addToCart(record)}>
          Добавить
        </Button>
      )
    },
  ];

  const orderColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Тип', dataIndex: 'order_type', key: 'order_type', render: (type: string) => {
      const types: any = { dine_in: '🏠 В зале', takeaway: '📦 С собой', courier: '🚚 Доставка' };
      return types[type] || type;
    }},
    { title: 'Инфо', key: 'info', render: (_: any, r: any) => {
      if (r.order_type === 'dine_in') return `Стол ${r.table_id} (${r.people_count} чел)`;
      return r.customer_name || '-';
    }},
    { title: 'Сумма', dataIndex: 'total_amount', render: (v: number) => <b>{v} ₸</b> },
    { 
      title: 'Статус', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string, record: any) => {
        const statusColors: any = { pending: 'orange', paid: 'green', cancelled: 'red' };
        const statusTexts: any = { pending: 'В обработке', paid: 'Оплачен', cancelled: 'Отменён' };
        return (
          <Dropdown
            menu={{
              items: [
                { key: 'paid', label: 'Оплачен', icon: <CheckCircleOutlined />, onClick: () => updateOrderStatus(record.id, 'paid') },
                { key: 'cancelled', label: 'Отменён', icon: <CloseCircleOutlined />, onClick: () => updateOrderStatus(record.id, 'cancelled') }
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
    { title: 'Комментарий', dataIndex: 'comment', key: 'comment', width: 200, render: (t: string) => t?.split('\n')[0] || '-' },
    { title: 'Время', dataIndex: 'created_at', render: (d: string) => d ? new Date(d).toLocaleString() : '-' },
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
              Корзина
            </Button>
          </Badge>
          <Tag color="gold">👤 {JSON.parse(localStorage.getItem('user') || '{}').username}</Tag>
          <Button icon={<LogoutOutlined />} onClick={() => { localStorage.clear(); setIsLoggedIn(false); message.success('Выход выполнен'); }}>
            Выйти
          </Button>
        </Space>
      </Header>
      <Layout>
        <Sider theme="light" width={220}>
          <Menu mode="inline" defaultSelectedKeys={['1']} className="h-full">
            <Menu.Item key="1" icon={<CoffeeOutlined />}>Меню</Menu.Item>
            <Menu.Item key="2" icon={<ShoppingCartOutlined />}>Заказы</Menu.Item>
          </Menu>
        </Sider>
        <Content className="p-6 bg-gray-50">
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={8}>
              <Card><Statistic title="Всего заказов" value={stats.totalOrders} prefix={<OrderedListOutlined />} /></Card>
            </Col>
            <Col span={8}>
              <Card><Statistic title="Выручка" value={stats.totalRevenue} prefix={<DollarOutlined />} suffix="₸" valueStyle={{ color: '#3f8600' }} /></Card>
            </Col>
            <Col span={8}>
              <Card><Statistic title="Активные заказы" value={stats.activeOrders} prefix={<ClockCircleOutlined />} /></Card>
            </Col>
          </Row>
          
          <Card 
            title="📋 Наше меню" 
            className="mb-6" 
            extra={<Button type="primary" icon={<ShoppingOutlined />} onClick={() => setIsCartVisible(true)}>Корзина ({cart.length})</Button>}
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
          
          <Card title="🛒 История заказов">
            <Table dataSource={orders} columns={orderColumns} rowKey="id" scroll={{ x: 1000 }} />
          </Card>
        </Content>
      </Layout>

      {/* Корзина */}
      <Drawer
        title="🛒 Корзина заказа"
        placement="right"
        open={isCartVisible}
        onClose={() => setIsCartVisible(false)}
        width={400}
      >
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Корзина пуста</div>
        ) : (
          <>
            <List
              dataSource={cart}
              renderItem={(item: CartItem) => (
                <List.Item
                  actions={[
                    <InputNumber 
                      key="quantity"
                      min={1} 
                      value={item.quantity} 
                      onChange={(val) => updateQuantity(item.id, val || 1)} 
                      size="small" 
                      style={{ width: 60 }} 
                    />,
                    <Button 
                      key="delete"
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeFromCart(item.id)} 
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<CoffeeOutlined />} />}
                    title={item.name}
                    description={`${item.price} ₸ x ${item.quantity} = ${item.price * item.quantity} ₸`}
                  />
                </List.Item>
              )}
            />
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="text-lg font-bold">Итого:</span>
                <span className="text-xl font-bold text-green-600">{cartTotal} ₸</span>
              </div>
              <Button type="primary" block size="large" onClick={() => { setIsCartVisible(false); setIsModalVisible(true); }}>
                Оформить заказ
              </Button>
            </div>
          </>
        )}
      </Drawer>

      {/* Форма оформления */}
      <Modal
        title="Оформление заказа"
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        footer={null}
        width={500}
      >
        <Form form={form} onFinish={createOrder} layout="vertical">
          <Form.Item label="Тип заказа" required>
            <Radio.Group value={orderType} onChange={(e) => setOrderType(e.target.value)} buttonStyle="solid">
              <Radio.Button value="dine_in">🏠 В зале</Radio.Button>
              <Radio.Button value="takeaway">📦 С собой</Radio.Button>
              <Radio.Button value="courier">🚚 Доставка</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {orderType === 'dine_in' && (
            <>
              <Form.Item name="table_id" label="Номер стола" rules={[{ required: true, message: 'Введите номер стола' }]}>
                <InputNumber min={1} max={50} className="w-full" placeholder="Например: 5" />
              </Form.Item>
              <Form.Item name="people_count" label="Количество гостей" rules={[{ required: true, message: 'Укажите количество' }]}>
                <InputNumber min={1} max={20} className="w-full" placeholder="Сколько человек?" />
              </Form.Item>
            </>
          )}

          {orderType !== 'dine_in' && (
            <>
              <Form.Item name="customer_name" label="Имя клиента" rules={[{ required: true, message: 'Введите имя' }]}>
                <Input prefix={<UserOutlined />} placeholder="Имя клиента" />
              </Form.Item>
              <Form.Item name="customer_phone" label="Телефон">
                <Input placeholder="+7 XXX XXX XX XX" />
              </Form.Item>
            </>
          )}

          {orderType === 'courier' && (
            <Form.Item name="courier_name" label="Имя курьера">
              <Input prefix={<CarOutlined />} placeholder="Имя курьера" />
            </Form.Item>
          )}

          <Form.Item name="comment" label="Комментарий">
            <TextArea rows={3} placeholder="Особые пожелания, аллергии..." />
          </Form.Item>

          <div className="bg-gray-100 p-3 rounded mb-4">
            <div className="font-bold mb-2">🍽️ Состав заказа:</div>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span>{item.name} x {item.quantity}</span>
                <span>{item.price * item.quantity} ₸</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
              <span>Итого:</span>
              <span className="text-green-600 text-lg">{cartTotal} ₸</span>
            </div>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              ✅ Подтвердить заказ на {cartTotal} ₸
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App;