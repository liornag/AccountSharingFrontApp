import { Button, Modal, Table, InputNumber } from "antd";
import { useState, useEffect } from "react";

const ChooseItems = ({ isModalOpen, handleOk, handleCancel, items }) => {

  const [modalItems, setModalItems] = useState(items);
  const totalPrice = modalItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0
  );
  useEffect(() => {
    setModalItems(items);
  }, [items]);

  const handleQuantityChange = (id, quantity) => {
    setModalItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: quantity } : item
      )
    );
  };

  const columns = [
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (value, record) => (
        <InputNumber
          min={0}
          max={record.quantity}
          value={record.quantity}
          onChange={(val) => handleQuantityChange(record._id, val)}
          controls={true}
          style={{ width: 50 }}
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price) => `${(price ?? 0).toFixed(2)}`,
    },
    {
      title: "Subtotal",
      key: "subtotal",
      align: "right",
      render: (_, record) =>
        `${((record.price ?? 0) * record.quantity).toFixed(2)}`,
    },
  ];

  return (
    <Modal
      title="Basic Modal"
      closable={{ "aria-label": "Custom Close Button" }}
      open={isModalOpen}
      onOk={() => handleOk(modalItems)}
      onCancel={handleCancel}
    >
      <Table
        dataSource={modalItems}
        columns={columns}
        rowKey="_id"
        pagination={false}
      />
      <div style={{ textAlign: "right", marginTop: 16, fontWeight: "bold" }}>
        Total: {totalPrice}
      </div>
    </Modal>
  );
};

export default ChooseItems;
