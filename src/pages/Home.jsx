import { Button, Form, Input, List, Modal, Select } from "antd";
import { useState, useEffect } from "react";
import useLogout from "../hooks/useLogout";
import { useDispatch, useSelector } from "react-redux";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import toast from "react-hot-toast";
import { setTask } from "../store/slice/userSlice";

function Home() {
  const { Option } = Select;
  const [form] = Form.useForm();
  const [data2render, setData2Render] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [latitude, setLatitude] = useState(29.7453);
  const [longitude, setLongitude] = useState(29.7453);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  
  const { logout } = useLogout();
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.username);

  useEffect(() => {
    weatherDataCall();
    const storedData = JSON.parse(localStorage.getItem("task")) || [];
    const filteredData = storedData.filter((item) => item.user === user);
    setData2Render(filteredData);
  }, [user]);

  // calling open weather api
  const weatherDataCall = async () => {
    try {
      const weatherData = await axios.post(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
      );
      console.log(weatherData.data);
      toast.success("Weather Data Fetched Successfully");
      setWeatherData(weatherData.data);
    } catch (error) {
      toast.error("Error Fetching Weather Data");
    }
  };

  // to close modal
  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  //to handle logout
  const handleLogout = () => {
    setData2Render([]);
    logout();
  };

  // to handle the add task functionality from modal
  const onFinish = (values) => {
    const newData = {
      user: user,
      title: values.title,
      description: values.titleDescription,
      priority: values.priority,
    };

    const storedData = JSON.parse(localStorage.getItem("task")) || [];
    const updatedData = [...storedData, newData];
    setData2Render((prevData) => [...prevData, newData]);
    localStorage.setItem("task", JSON.stringify(updatedData));

    dispatch(setTask(updatedData));

    // to delay closing of modal
    setTimeout(() => {
      setIsModalOpen(false);
    }, 500);
    form.resetFields();
  };

  // to handle the delete functionality of the task
  const handleDelete = (index) => {
    setData2Render((prevData) => prevData.filter((_, i) => i !== index));
    localStorage.setItem(
      "task",
      JSON.stringify(data2render.filter((_, i) => i !== index))
    );
  };

  return (
    <div>
      <h1 className="text-3xl text-center font-bold">Welcome {user}!</h1>
      <div className="flex justify-between mt-6 px-6">
        <Button type="primary" onClick={() => setIsModalOpen(!isModalOpen)}>
          +Create Task
        </Button>
        <Button onClick={handleLogout}>logout</Button>
      </div>
      <div className="p-6" style={{ maxHeight: "800px", overflowY: "auto" }}>
        <List
          itemLayout="horizontal"
          dataSource={data2render}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button
                  key="list-loadmore-edit"
                  onClick={() => handleDelete(index)}
                  icon={<DeleteOutlined className=" text-red-500" />}
                  className="border-red-500 "
                ></Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="overflow-auto max-h-40 ">
                    {" "}
                    <span className="font-bold text-black">Title:</span>{" "}
                    {item.title}
                  </div>
                }
                description={
                  <div className="overflow-auto max-h-40 ">
                    {" "}
                    <span className="font-bold text-black">
                      Description:
                    </span>{" "}
                    {item.description}
                  </div>
                }
              />
              <div className="flex flex-col justify-center md:flex-col gap-1 ">
                <span className="font-bold">Priority: {item.priority}</span>
                {weatherData && (
                  <div className=" flex flex-col gap-1 md:flex-row">
                    <span className=" font-semibold hidden md:flex">{`Weather Details =>`}</span>
                    <span className=" font-bold ">
                      Weather: {weatherData.weather[0].description}
                    </span>
                    <span className=" hidden md:flex">||</span>
                    <span className=" font-bold ">
                      Humidity: {weatherData.main.humidity.toFixed(2)}%
                    </span>
                    <span className=" hidden md:flex">||</span>
                    <span className=" font-bold ">
                      Temperature: {(weatherData.main.temp / 10).toFixed(2)}°C
                    </span>
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      </div>
      <Modal
        title="Add Task"
        open={isModalOpen}
        onCancel={handleCancel}
        maskClosable={false}
        footer={null}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
                message: "Please input task title!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Title Description"
            name="titleDescription"
            rules={[
              {
                required: true,
                message: `Please input title description!`,
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Select the Priority"
            rules={[
              {
                required: true,
                message: "Please select Priority!",
              },
            ]}
          >
            <Select placeholder="Select the Priority">
              <Option value="low">Low</Option>
              <Option value="normal">Normal</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end">
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Add task{" "}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default Home;
