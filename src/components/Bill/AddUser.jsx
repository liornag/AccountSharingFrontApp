import { Modal, Input, QRCode, Button } from "antd";
import { useState } from "react";
import api from "../../lib/api";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ReloadOutlined } from "@ant-design/icons";

const AddUser = ({ isModalOpen, handleOk, handleCancel }) => {
  const [link, setLink] = useState('');
  const { sessionId } = useParams();

  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["link"],
    queryFn: () =>
      api.post(`/bills/${sessionId}/invite`).then((res) => {
        setLink(res.data.inviteLink)
        return res.data;
      }),
    retry: false,
    enabled: isModalOpen,
  });

  return (
    <Modal
      title="Invite"
      closable={{ "aria-label": "Custom Close Button" }}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
    >
   
      <QRCode value={link || '-'} />
      <Button icon={<ReloadOutlined />} type="primary" onClick={() => refetch()}>Regenerate Link</Button>
    </Modal>
  );
};

export default AddUser;
