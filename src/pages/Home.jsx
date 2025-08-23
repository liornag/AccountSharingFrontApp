import { useNavigate } from "react-router-dom";
import { Card, Col, Row, Typography, Empty, Avatar } from "antd";
import { useQuery } from "@tanstack/react-query";
import stringToColor from "../lib/utils";
const { Title } = Typography;
import "./Home.css";
import api from "../lib/api";

function Home() {
  const navigate = useNavigate();
  const {
    data = { bills: [] },
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getBills"],
    queryFn: () => api.post("/bills").then((res) => res.data),
  });

  if(isError){
    return <div>Login to show...</div>
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        {/* Left Column: Bills List */}
        <Col xs={24} md={16}>
          <Title level={3}>Your Split Bills</Title>

          {!data.bills || data.bills.length === 0 ? (
            <Empty description="No bills yet. Create one to get started!" />
          ) : (
            <Row gutter={[16, 16]}>
              {data.bills.map((bill) => (
                <Col xs={24} sm={12} lg={8} key={bill._id}>
                  <Card
                    hoverable
                    title={
                      <div>
                        <p style={{ color: "#555" }}>{new Date(bill.createdAt).toLocaleDateString()}</p> 
                        <p>{bill.name}</p>
                      </div>
                    }
                    extra={<p style={{ fontWeight: 600, color: bill.state === 'Not Paid' ? "#E43636" : '#7ADAA5' }}>{bill.state}</p>}
                    onClick={() => navigate(`/bill/${bill._id}`)}
                    style={{ textAlign: "left" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <p>
                        <strong style={{ color: "#555" }}>Total: </strong> {bill.total}
                      </p>
                      <p>
                        {bill.participants.map((participant) => {
                          const initials = participant?.id?.username
                            ?.slice(0, 2)
                            .toUpperCase();
                          const bgColor = stringToColor(initials);
                          return(
                          <Avatar style={{ backgroundColor: bgColor }}>
                            {initials}
                          </Avatar>)
                        })}
                      </p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>

      </Row>
    </div>
  );
}

export default Home;
