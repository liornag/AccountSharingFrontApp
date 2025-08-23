import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import ShareBillModal from "./ShareBillModal";
import "./Bill.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ScrollableAvatarList from "../components/Bill/ScrollableAvatarList";
import {
  Table,
  Checkbox,
  Button,
  message,
  Avatar,
  Result,
  Divider,
  Progress,
  Typography 
} from "antd";
const { Title } = Typography;
import { getTotalPaidByCurrentUser } from "../lib/helpers";
import ChooseItems from "../components/Bill/ChooseItems";
import { useAuth } from "../hooks/useAuth";
import { CheckCircleOutlined } from "@ant-design/icons";
import { isAxiosError } from "axios";
import stringToColor from "../lib/utils";



export default function Bill() {
  const { sessionId } = useParams();
  const { user, socket } = useAuth();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [currency, setCurrency] = useState("₪");
  const [bill, setBill] = useState(null);
  const [items, setItems] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();


  const showModal = () => {
    console.log(items);
    const filteredItems = data.items.filter((item) =>
      !item.lockedBy.disabled && selections.has(item._id.toString())
    );

    if (filteredItems.length === 0) {
      messageApi.info("No items chosen");
    } else {
      setIsModalOpen(true);
    }
  };

  const showAddUserModal = () => {
    if(data.state === 'Paid') return;
    setShowAddUser(true);
  };

  const handleCloseShowAddUserModal = () => {
    setShowAddUser(false);
  };

  const handleOk = async (pickedItems) => {
    await api.post(`/bills/${sessionId}/pay-items`, { items: pickedItems });
    setIsModalOpen(false);
    setSelections(new Set());
  };

  const handleCancel = async () => {
    await api.post(`/bills/${sessionId}/unlock-items`, {
      items: [...selections],
    });
    setIsModalOpen(false);
    setSelections(new Set());
  };

  const [selections, setSelections] = useState(new Set());

  const handleSelectChange = async (id, selected) => {
    setSelections((prev) => {
      const s = new Set(prev);
      if (selected) {
        s.add(id);
      } else {
        s.delete(id);
      }
      return s;
    });
  };

  const handleChooseItems = async () => {

    const disabledItems = new Set();
    items.forEach((item) => {
      if (item.lockedBy.disabled) {
        disabledItems.add(item._id);
      }
    });

    setSelections(
      new Set([...selections].filter((id) => !disabledItems.has(id)))
    );
    try {
      const res = await api.post(`/bills/${sessionId}/lock-items`, {
        items: [...selections],
      });
      const lockedIDs = res.data.updatedItems.map((locked) => locked._id)
      setSelections(new Set(lockedIDs))
      if(lockedIDs.length){
        showModal()
      }
    } catch (error) {
      console.log(error)
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bill", sessionId], // add sessionId to key
    queryFn: async () => {
      try {
        const res = await api.post(`/bills/${sessionId}`);
        if (res.status !== 200) {
          //console.log("Unauthorized");
          throw new Error("Unauthorized");
        }
        return res.data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setItems(data.items);
      setSelections(
        new Set(
          data.items
            .filter((item) => item?.lockedBy?.user === user.username)
            .map((item) => item._id)
        )
      );
    },
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socket || !sessionId) return;
    // Join the bill room when component mounts
    socket.emit("joinBill", sessionId);

    // Listen for bill events
    socket.on("billEvent", (event) => {
      console.log("📢 Bill Event:", event);

      if (event.type === "UPDATE") {
        // update local state with new bill data
        if (event.message) {
          messageApi.info(event.message);
        }
        queryClient.invalidateQueries(["bill", sessionId]);
      }
    });

    return () => {
      socket.emit("leaveBill", sessionId);
      socket.off("billEvent");
    };
  }, [sessionId, queryClient, socket]);

  if (isLoading) return <div>Loading bill…</div>;
  if (error || isAxiosError(error)) {
    const isUnauthorized =
      error instanceof Error && /403|401/.test(error.message);

    return (
      <Result
        status="403"
        title={isUnauthorized ? "Unauthorized" : "Error"}
        subTitle={
          isUnauthorized
            ? "You do not have permission to view this bill."
            : "Something went wrong. Please try again."
        }
        extra={
          <>
            {isUnauthorized ? null : (
              <Button type="primary" onClick={() => refetch()}>
                Retry
              </Button>
            )}
          </>
        }
      />
    );
  }

  const columns = [
    {
      title: "Select",
      dataIndex: "_id",
      key: "select",
      align: "center",
      render: (_, record) =>
        record.quantity === 0 ? (
          <CheckCircleOutlined style={{ color: "green", fontSize: 24 }} />
        ) : (
          <Checkbox
            disabled={record.lockedBy?.disabled}
            checked={selections.has(record._id)}
            onChange={(e) => handleSelectChange(record._id, e.target.checked)}
          />
        ),
    },
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Qty",
      dataIndex: "_id",
      key: "qty",
      align: "right",
      render: (_, record) => <div>{record.quantity}</div>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (_, record) => {
        return record.price;
      },
    },
    {
      title: "Chosen",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <Avatar.Group>
            {record.paidBy?.filter(user => user.quantity).map((user) => {
              const initials = user?.userId?.username.slice(0, 2).toUpperCase();
              const bgColor = stringToColor(initials);

              return (
                <Avatar style={{ backgroundColor: bgColor }}>{initials}</Avatar>
              );
            })}
          </Avatar.Group>
        </div>
      ),
    },
  ];

  return (
    <div className="bill-wrapper">
      {contextHolder}
      <div className="bill-container">
        <div className="bill-top">
          <button className="bill-btn secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <h2 className="bill-title">Shared Bill</h2>
        <Divider plain />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 4,
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: 18, color: "#222" }}>
              {data.name}
            </span>
            <span style={{ fontSize: 14, color: "#555" }}>
              {data.billContentType}
            </span>
            <span style={{ fontSize: 12, color: "#777" }}>
              {data.description}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Progress
              type="circle"
              percent={Math.round((data.totalPaid / data.total) * 100)} // 0-100
              strokeColor="#4ade80" // optional: green
              trailColor="#e5e7eb" // optional: light gray background
              strokeWidth={8} // thickness
              size={60}
              format={(percent) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: "bold" }}>
                    {percent}%
                  </span>
                  <span style={{ fontSize: 10, color: "#555" }}>Paid</span>
                </div>
              )}
            />
            <p>
              ₪ {data.totalPaid} / ₪ {data.total}
            </p>
          </div>
        </div>

        <ScrollableAvatarList
          paidBy={data.paidBy}
          data={data.participants}
          isModalOpen={showAddUser}
          handleOk={handleCloseShowAddUserModal}
          handleCancel={handleCloseShowAddUserModal}
          showAddUserModal={showAddUserModal}
        />
        <Table
          dataSource={data.items}
          columns={columns}
          rowKey={(record) => record._id}
          pagination={false}
        />
        <ChooseItems
          isModalOpen={isModalOpen}
          handleOk={handleOk}
          handleCancel={handleCancel}
          items={data.items.filter((item) => !item.lockedBy.disabled && selections.has(item._id))}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "5px",
          }}
        >
          {data.state === "Not Paid" ? (
            <Button onClick={() => handleChooseItems()}>Choose items</Button>
          ) : (
            <p style={{ fontWeight: 600, color: "#7ADAA5" }}>
              Bill has been paid!
            </p>
          )}
          <div style={{ textAlign: "right", fontWeight: "bold" }}>
            Total: {data.total} ₪
          </div>
        </div>
        <Title level={2}>You Paid: ₪ {getTotalPaidByCurrentUser(user.username, data.paidBy)}</Title>
        {isOwner && isShareModalOpen && (
          <ShareBillModal
            billId={bill._id}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
