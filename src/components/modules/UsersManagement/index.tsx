"use client";

import {
  Button,
  Checkbox,
  Flex,
  Input,
  Popconfirm,
  SelectProps,
  Space,
  Table,
  TableProps,
  Typography,
  Upload,
  message,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import {
  DownOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import _ from "lodash";

import { useTranslation } from "@/app/i18n/client";
import {
  useDeleteUserMutation,
  useEditUserMutation,
  useGetAllUsersQuery,
} from "@/store/queries/usersMangement";
import { createQueryString } from "@/utils/queryString";
import { useGetAllDepartmentsQuery } from "@/store/queries/departmentMangement";
import { useGetAllPositionQuery } from "@/store/queries/positionManagement";

import * as S from "./styles";
import { useGetAllMajorQuery } from "@/store/queries/majorManagement";

interface DataType {
  key: string;
  _id: string;
  name: string;
  position: string;
  major: string;
  department: string;
  isAdmin: boolean;
  isExcellent: boolean;
}

interface InterfaceDepartmentData {
  result: SelectProps["options"];
}

function UsersManagementModule() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editUser] = useEditUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const fileReader = new FileReader();

  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const { t } = useTranslation(params?.locale as string, "usersManagement");

  const { result, total, isFetching, refetch } = useGetAllUsersQuery(
    {
      page: page,
      page_size: 10,
      search: search,
    },
    {
      selectFromResult: ({ data, isFetching }) => {
        const newDataUsers = data?.data?.users?.map((user: any) => ({
          name: `${user?.firstname} ${user?.lastname}`,
          ...user,
        }));
        return {
          result: newDataUsers ?? [],
          total: data?.result ?? 0,
          isFetching,
        };
      },
    }
  );

  const departmentData: InterfaceDepartmentData = useGetAllDepartmentsQuery(
    undefined,
    {
      selectFromResult: ({ data, isFetching }) => {
        const newDepartmentData = data?.data?.map((department: any) => ({
          label: department.name,
          value: department._id,
          ...department,
        }));
        return {
          result: newDepartmentData ?? [],
          isFetching,
        };
      },
    }
  );

  const positionData: InterfaceDepartmentData = useGetAllPositionQuery(
    undefined,
    {
      selectFromResult: ({ data, isFetching }) => {
        const newPositionData = data?.data?.map((position: any) => ({
          label: position.name,
          value: position._id,
          ...position,
        }));
        return {
          result: newPositionData ?? [],
          isFetching,
        };
      },
    }
  );

  const majorData: InterfaceDepartmentData = useGetAllMajorQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => {
      const newMajorData = data?.data?.map((major: any) => ({
        label: major.name,
        value: major._id,
        ...major,
      }));
      return {
        result: newMajorData ?? [],
        isFetching,
      };
    },
  });

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "STT",
      dataIndex: "",
      key: "",
      width: 50,
      render: (text, _, index) => (
        <Typography.Text>{index + 1}</Typography.Text>
      ),
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("position"),
      dataIndex: "positionId",
      key: "positionId",
      width: 200,
      render: (value, record) => (
        <div>
          <S.Select
            options={positionData?.result}
            defaultValue={value?.name}
            onChange={(id: any) =>
              HandleField(id, record, positionData, "positionId")
            }
          >
            <Space>
              {value?.name}
              <DownOutlined />
            </Space>
          </S.Select>
        </div>
      ),
    },
    {
      title: t("department"),
      dataIndex: "departmentId",
      key: "departmentId",
      width: 200,
      render: (value, record) => (
        <div>
          <S.Select
            options={departmentData?.result}
            defaultValue={value?.name}
            onChange={(id: any) =>
              HandleField(id, record, departmentData, "departmentId")
            }
          >
            <Space>
              {value?.name}
              <DownOutlined />
            </Space>
          </S.Select>
        </div>
      ),
    },
    {
      title: t("major"),
      dataIndex: "majorId",
      key: "majorId",
      width: 200,
      render: (value, record) => (
        <div>
          <S.Select
            options={majorData?.result}
            defaultValue={value?.name}
            onChange={(id: any) =>
              HandleField(id, record, majorData, "majorId")
            }
          >
            <Space>
              {value?.name}
              <DownOutlined />
            </Space>
          </S.Select>
        </div>
      ),
    },
    {
      title: t("admin"),
      dataIndex: "isAdmin",
      key: "isAdmin",
      render: (value, record) => {
        return (
          <Flex justify="center" align="center">
            <Checkbox
              defaultChecked={record?.isAdmin}
              onChange={async () => {
                const newRecord = {
                  ...record,
                  isAdmin: !value,
                };
                handleEditUser(newRecord, true);
              }}
            ></Checkbox>
          </Flex>
        );
      },
    },
    {
      title: t("excellent"),
      dataIndex: "isExcellent",
      key: "isExcellent",
      render: (_, record) => {
        return (
          <Flex justify="center" align="center">
            <Checkbox
              defaultChecked={record?.isExcellent}
              onChange={async () => {
                const newRecord = {
                  ...record,
                  isExcellent: !record?.isExcellent,
                };
                handleEditUser(newRecord, true);
              }}
            ></Checkbox>
          </Flex>
        );
      },
    },
    {
      title: t("action"),
      key: "action",
      render: (_, record) => {
        return (
          <Flex justify="center" gap={20}>
            <Popconfirm
              title={t("deleteDepartment.title")}
              description={t("deleteDepartment.description")}
              okText={t("deleteDepartment.okText")}
              cancelText={t("deleteDepartment.cancelText")}
              onConfirm={() => handleDelete(record?._id)}
            >
              <Button
                type="primary"
                shape="circle"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Flex>
        );
      },
    },
  ];

  const HandleField = (
    id: string,
    record: any,
    dataField: any,
    type: string
  ) => {
    const newDataField = dataField?.result?.find(
      (data: any) => data._id === id
    );
    const { label, value, ...newData } = newDataField;
    const newEdit = {
      ...record,
      [type]: newData,
    };
    handleEditUser(newEdit, false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      refetch();
      message.success("Xóa thành công");
    } catch (err) {}
  };
  const handleEditUser = async (data: any, isfetch: boolean) => {
    try {
      await editUser({
        params: { id: data?._id },
        body: data,
      }).unwrap();
      if (isfetch) refetch();
      message.success("Thay đổi thành công");
    } catch (err) {}
  };
  const csvFileToArray = (string: any) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");
    console.log("first", csvRows);
    const array = csvRows.map((i: any) => {
      const values = i.split(",");
      const obj = csvHeader.reduce(
        (object: any, header: any, index: number) => {
          object[header] = values[index];
          return object;
        },
        {}
      );
      return obj;
    });
    console.log("aray : any", array);
  };
  const handleImportCsv = (e: any) => {
    const file = e?.target?.files[0];
    if (file) {
      fileReader.onload = function (event) {
        const text = event?.target?.result;
        csvFileToArray(text);
      };

      fileReader?.readAsText(file);
    }
  };

  const handleSearch = _.debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(createQueryString("search", `${e?.target?.value}`));
  }, 300);

  return (
    <S.PageWrapper>
      <S.Head>
        <Typography.Title level={2}>{t("title")}</Typography.Title>
      </S.Head>
      <S.FilterWrapper>
        <div className="search">
          <Typography.Title level={5}>{t("search")}</Typography.Title>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            defaultValue={search}
          />
        </div>
        <div className="input_csv">
          <Button
            icon={<UploadOutlined />}
            onClick={() => {
              const inputFile = document.getElementById("import_csv");
              inputFile?.click();
            }}
          >
            {t("import")}{" "}
          </Button>
          <input id="import_csv" type="file" onChange={handleImportCsv} />
        </div>
      </S.FilterWrapper>
      <S.TableWrapper>
        <Table
          columns={columns}
          dataSource={result}
          loading={isFetching}
          rowKey={(record) => record._id}
        />
      </S.TableWrapper>
    </S.PageWrapper>
  );
}

export default UsersManagementModule;
