import { Avatar, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AddUser from "../Bill/AddUser";
import stringToColor from "../../lib/utils";
import { getTotalPaidByCurrentUser } from "../../lib/helpers";

const avatars = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=6",
];

const ScrollableAvatarList = ({
  isModalOpen,
  handleOk,
  handleCancel,
  showAddUserModal,
  data,
  paidBy,
}) => {
  return (
    <div
      style={{
        display: "flex",
        overflowX: "auto",
        padding: "8px",
        gap: "8px",
        whiteSpace: "nowrap",
        marginTop: 10,
      }}
    >
      {data.map((src, index) => {
        const initials = src.id.username.slice(0, 2).toUpperCase();
        const bgColor = stringToColor(initials);
        const totalPaid = getTotalPaidByCurrentUser(src.id.username, paidBy)

        return (
          <div>
          <Avatar
            key={index}
            size={50}
            style={{ backgroundColor: bgColor, color: "#fff" }}
          >
            {initials}
          </Avatar>
          <p style={{ color: "#333" }}><b>₪ {totalPaid}</b></p>
          </div>
        );
      })}

      <AddUser
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
      />
      {(data.state === 'Not Paid'  || !data.state)&& (<Button
        type="dashed"
        shape="circle"
        icon={<PlusOutlined />}
        style={{
          width: 50,
          height: 50,
          minWidth: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => showAddUserModal()}
      />)}
    </div>
  );
};

export default ScrollableAvatarList;
