import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Label,
  Pagination,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setToken } from "../../../../store/authSlice";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
const ExcelJS = require("exceljs");

export default function ListUser() {
  const basUrl = "http://localhost:8070/";
  const dispatch = useDispatch();
  const activeClassname = "bg-gradient-to-r from-green-300 to-blue-400";
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [sort, setSort] = useState({ sortBy: "", sortDir: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const roles = ["ADMIN", "LECTURER", "STUDENT"];
  const [datas, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [types, setTypes] = useState("Khen thưởng");
  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `/user/get/all?page=${currentPage}&size=${pageSize}&sortBy=${sort.sortBy}&sortDir=${sort.sortDir}&searchTerm=${searchTerm}`
      );
      setUsers(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      if (error.response.status === 403) {
        dispatch(setToken(""));
      }
    }
  }, [currentPage, dispatch, pageSize, sort, searchTerm]);
  const getJob = useCallback(async () => {
    try {
      const { data } = await axios.get(`/user/job/get/all`);
      setJobs(data);
    } catch (error) {
      if (error.response.status === 403) {
        dispatch(setToken(""));
      }
    }
  }, [dispatch]);
  const getActivityYear = useCallback(async () => {
    try {
      const { data } = await axios.get(`/activities/get/years`);
      setYears(data);
    } catch (error) {
      if (error.response.status === 403) {
        dispatch(setToken(""));
      }
    }
  }, [dispatch]);
  const getListLecturer = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `/user/lecturers?academicYear=${currentYear}&type=${types}`
      );
      setData(data);
    } catch (error) {
      if (error.response.status === 403) {
        dispatch(setToken(""));
      }
    }
  }, [dispatch, currentYear, types]);

  useEffect(() => {
    document.title = "Danh sách người dùng";
    getJob();
    getActivityYear();
    getListLecturer();
    fetchData();
  }, [fetchData, getJob, getActivityYear, getListLecturer]);
  const handelChangeYaer = (a) => {
    setCurrentYear(a);
  };
  const handleTypeChange = (a) => {
    setTypes(a);
  };
  const exportExcelFile = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet 1");
    sheet.columns = [
      {
        header: "Tên",
        key: "name",
        width: 15,
      },
      {
        header: "Mã số",
        key: "username",
        width: 15,
      },
      {
        header: "Email",
        key: "email",
        width: 20,
      },
      {
        header: "Chức danh",
        key: "jobTitle",
        width: 30,
      },
      {
        header: "Số hoạt động tham gia",
        key: "countConfirm",
        width: 20,
      },
      {
        header: "Số giờ đã tích lỹ",
        key: "totalHours",
        width: 20,
      },
      {
        header: "Số giờ bắt buộc",
        key: "requiredHours",
        width: 20,
      },
    ];

    const promise = Promise.all(
      datas?.map(async (item, index) => {
        sheet.addRow({
          name: item?.name,
          username: item?.username,
          email: item?.email,
          jobTitle: item?.jobTitle,
          countConfirm: item?.countConfirm,
          totalHours: item?.totalHours,
          requiredHours: item?.requiredHours,
        });
      })
    );

    promise.then(() => {
      workbook.xlsx.writeBuffer().then(function (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `Danh sách giảng viên ${types} năm ${currentYear}.xlsx`;
        anchor.click();
      });
    });
  };
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber - 1);
    fetchData();
  };

  const handleSortChange = (sortBy, sortDir) => {
    setSort({ sortBy: sortBy, sortDir: sortDir });
    setCurrentPage(0);
    fetchData();
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    fetchData();
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setSort({ sortBy: "id", sortDir: "ASC" });
    setPageSize(10);
    setCurrentPage(0);
  };
  const showFormCreate = () => {
    const options = jobs
      .map((item) => `<option value="${item.name}">${item.name}</option>`)
      .join("");

    Swal.fire({
      title: "Thêm người dùng",
      html: `
        <input type="text" id="name" class="swal2-input" placeholder="Name" style="height:35px;width:395px">
        <input type="text" id="username" class="swal2-input" placeholder="Username" style="height:35px;width:395px">
        <input type="email" id="email" class="swal2-input" placeholder="Email" style="height:35px;width:395px">
        <select id="gender" class="swal2-input" style="height:35px;width:395px">
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
        <input type="password" id="password" class="swal2-input" placeholder="Password" style="height:35px;width:395px">
        <input type="password" id="cpassword" class="swal2-input" placeholder="Confirm Password" style="height:35px;width:395px">
        <select id="role" class="swal2-input" style="height:35px;width:395px">
          <option value="ADMIN">ADMIN</option>
          <option value="LECTURER">LECTURER</option>
          <option value="STUDENT">STUDENT</option>
        </select>
        <select id="job" name="job" class="swal2-input" tooltip="tooltip" title="Chức danh"
          style="height:35px;width:395px;display:none;text-align:center>
          ${options}
        </select>
      `,
      focusConfirm: false,
      didOpen: () => {
        const roleSelect = document.getElementById("role");
        roleSelect.addEventListener("change", () => {
          const selectedRole = roleSelect.value;
          const jobSelect = document.getElementById("job");
          if (selectedRole === "LECTURER") {
            jobSelect.style.display = "block";
          } else {
            jobSelect.style.display = "none";
          }
        });
      },
      preConfirm: () => {
        const name = Swal.getPopup().querySelector("#name").value;
        const username = Swal.getPopup().querySelector("#username").value;
        const email = Swal.getPopup().querySelector("#email").value;
        const gender = Swal.getPopup().querySelector("#gender").value;
        const password = Swal.getPopup().querySelector("#password").value;
        const cpassword = Swal.getPopup().querySelector("#cpassword").value;
        const role = Swal.getPopup().querySelector("#role").value;
        let job = Swal.getPopup().querySelector("#job").value;
        if (role !== "LECTURER") {
          job = null;
        }
        // Check if email is valid
        if (!/\S+@\S+\.\S+/.test(email)) {
          Swal.showValidationMessage("Email không hợp lệ");
          return false; // prevent closing the modal
        }

        // Check if passwords match
        if (password !== cpassword) {
          Swal.showValidationMessage("Mật khẩu không khớp");
          return false; // prevent closing the modal
        }

        // Check if required fields are not empty
        if (!name || !email || !username || !password || !gender) {
          Swal.showValidationMessage("Vui lòng nhập đủ thông tin");
          return false; // prevent closing the modal
        }

        // Submit the form if all checks pass
        const newData = { name, username, email, gender, password, role, job };
        return axios
          .post("/auth/signup", newData)
          .then((response) => {
            fetchData();
            handleSortChange("createdAt", "DESC");
            toast.success("Thêm thành công");
          })
          .catch((error) => {
            if (error.response.data.message === "ERROR: EMAIL WAS USED") {
              Swal.showValidationMessage("Email đã tồn tại");
            } else if (
              error.response.data.message === "ERROR: USERNAME WAS USED"
            ) {
              Swal.showValidationMessage("Username đã tồn tại");
            } else {
              Swal.showValidationMessage("Có lỗi xảy ra khi thêm người dùng");
              //console.error(error);
            }
            return false; // prevent closing the modal
          });
      },
    });
  };
  const handleStatusChange = (username, status) => {
    const newStatus = { username, status };
    axios
      .post("/user/update/status", newStatus)
      .then((res) => {
        fetchData();
        //console.log(res)
        if (res.data.message === "WARNING") {
          toast.warning("Không thay đổi");
        } else {
          toast.success("Cập nhật trạng thái thành công");
        }
      })
      .catch((error) => {
        if (error.response.data.message === "ERROR") {
          toast.error("Không thể thay đổi trang thái của admin");
        }
        console.error(error);
      });
  };
  const handleRoleChange = (username, role) => {
    const newRole = { username, role };
    axios
      .post("/user/update/role", newRole)
      .then((res) => {
        fetchData();
        //console.log(res)
        if (res.data.message === "WARNING") {
          toast.warning("Không thay đổi");
        } else {
          toast.success("Cập nhật quyền thành công");
        }
      })
      .catch((error) => {
        if (error.response.data.message === "ERROR") {
          toast.error("Không thể thay đổi quyền của admin");
        }
        console.error(error);
      });
  };
  return users === null ? (
    <Spinner color="failure" />
  ) : (
    <Card>
      <table className="table table-bordered" style={{ display: "none" }}>
        <thead style={{ background: "yellow" }}>
          <tr>
            <th scope="col">Tên</th>
            <th scope="col">Username</th>
            <th scope="col">Email</th>
            <th scope="col">Chức danh</th>
            <th scope="col">Số hoạt động tham gia</th>
            <th scope="col">Số giờ đã tích lỹ</th>
            <th scope="col">Số giờ bắt buộc</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(datas) &&
            datas?.map((row) => (
              <tr key={row.username}>
                <td>{row?.name}</td>
                <td>{row?.username}</td>
                <td>{row?.email}</td>
                <td>{row?.jobTitle}</td>
                <td>{row?.countConfirm}</td>
                <td>{row?.totalHours}</td>
                <td>{row?.requiredHours}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center">
        <Label className="text-xl">Danh sách người dùng</Label>
        <div className="flex items-center">
          <TextInput
            type="text"
            placeholder="Tìm kiếm"
            value={searchTerm}
            onChange={handleInputChange}
            className="py-1 mr-2"
            style={{ height: "30px", width: "350px" }}
          />
          <Button
            className={activeClassname}
            style={{ height: "30px" }}
            onClick={() => handleSortChange("id", "ASC")}
          >
            Tìm kiếm
          </Button>
        </div>
        <Button
          style={{ height: "30px" }}
          onClick={() => showFormCreate()}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span className="ml-2">Thêm</span>
        </Button>
      </div>
      <div className="flex justify-center items-center">
        <div className="flex flex-wrap gap-2 ml-9">
          <Badge color="white">Chế độ sắp xếp:</Badge>
          <Badge onClick={() => handleRefresh()} color="failure">
            Làm mới
          </Badge>
          <Badge onClick={() => handleSortChange("id", "ASC")} color="info">
            Mã số
          </Badge>
          <Badge
            onClick={() => handleSortChange("createdAt", "DESC")}
            color="warning"
          >
            Ngày tạo
          </Badge>
          <Badge
            onClick={() => handleSortChange("updatedAt", "DESC")}
            color="purple"
          >
            Ngày cập nhật
          </Badge>
          <Badge color="white">Số hàng:</Badge>
          <Dropdown
            label={pageSize}
            style={{ height: "21px", width: "50px" }}
            color="greenToBlue"
          >
            <Dropdown.Item onClick={() => handlePageSizeChange(5)}>
              5
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handlePageSizeChange(10)}>
              10
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handlePageSizeChange(15)}>
              15
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handlePageSizeChange(20)}>
              20
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="flex flex-wrap gap-2 ml-9">
          <Badge color="white">Xuất danh sách giảng viên theo:</Badge>
          <Badge color="white">Loại: </Badge>
          <Dropdown
            label={types}
            style={{ height: "21px", width: "150px" }}
            color="white"
          >
            <Dropdown.Item onClick={() => handleTypeChange("Khen thưởng")}>
              Khen thưởng
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleTypeChange("Khiển trách")}>
              Khiển trách
            </Dropdown.Item>
          </Dropdown>
          <Badge color="white">Năm:</Badge>
          <Dropdown
            label={currentYear}
            style={{ height: "21px", width: "60px" }}
            color="white"
          >
            {years.map((year) => (
              <Dropdown.Item
                key={year}
                value={year}
                onClick={() => handelChangeYaer(year)}
              >
                {year}
              </Dropdown.Item>
            ))}
          </Dropdown>
          <Button
            style={{ height: "21px", width: "40px" }}
            onClick={exportExcelFile}
            gradientDuoTone="cyanToBlue"
          >
            Xuất
          </Button>
        </div>
      </div>
      <Table hoverable={true}>
        <Table.Head className={activeClassname}>
          <Table.HeadCell></Table.HeadCell>
          <Table.HeadCell>Ảnh đại diện</Table.HeadCell>
          <Table.HeadCell onClick={() => handleSortChange("name", "ASC")}>
            Tên
          </Table.HeadCell>
          <Table.HeadCell onClick={() => handleSortChange("username", "ASC")}>
            Username
          </Table.HeadCell>
          <Table.HeadCell>Quyền</Table.HeadCell>
          <Table.HeadCell>Trạng thái</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {users.map((item, index) => (
            <Table.Row
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
              key={item.id}
            >
              <Table.Cell>{index + 1}</Table.Cell>
              <Table.Cell className="whitespace-normal font-medium text-gray-900 dark:text-white">
                <img
                  src={basUrl + "files/" + item.avatar}
                  alt="aaa"
                  width="50px"
                  height="50px"
                />
              </Table.Cell>
              <Table.Cell className="whitespace-normal font-medium text-gray-900 dark:text-white">
                {item.name}
              </Table.Cell>
              <Table.Cell className="whitespace-normal font-medium text-gray-900 dark:text-white">
                {item.username}
              </Table.Cell>
              <Table.Cell className="whitespace-normal font-medium text-gray-900 dark:text-white">
                {roles.includes(item.role) && (
                  <Dropdown
                    label={item.role}
                    style={{ height: "21px", width: "90px" }}
                    color="white"
                  >
                    {roles.map((role, index) => (
                      <Dropdown.Item
                        onClick={() => handleRoleChange(item.username, role)}
                        key={index + 1}
                      >
                        {role}
                      </Dropdown.Item>
                      
                    ))}
                  </Dropdown>
                )}
              </Table.Cell>
              <Table.Cell className="whitespace-normal font-medium text-gray-900 dark:text-white text-center">
                <Dropdown
                  label={item.status === 1 ? "active" : "disable"}
                  style={{ height: "21px", width: "80px" }}
                  gradientDuoTone={
                    item.status === 1 ? "tealToLime" : "pinkToOrange"
                  }
                >
                  <Dropdown.Item
                    onClick={() => handleStatusChange(item.username, "active")}
                  >
                    <Badge color="success" className="flex justify-center">
                      active
                    </Badge>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleStatusChange(item.username, "disable")}
                  >
                    <Badge color="failure" className="flex justify-center">
                      disable
                    </Badge>
                  </Dropdown.Item>
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Pagination
        className="flex justify-center "
        currentPage={currentPage + 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Card>
  );
}
