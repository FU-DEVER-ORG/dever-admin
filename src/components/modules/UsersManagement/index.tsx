"use client";

import {
  Button,
  Checkbox,
  Flex,
  Input,
  Pagination,
  Popconfirm,
  SelectProps,
  Space,
  Table,
  TableProps,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { SearchOutlined } from "@ant-design/icons";
import { DownOutlined } from "@ant-design/icons";
import _ from "lodash";

import { useTranslation } from "@/app/i18n/client";
import {
  useDeleteUserMutation,
  useEditUserMutation,
  useGetAllUsersQuery,
} from "@/store/queries/usersMangement";
import { createQueryString } from "@/utils/queryString";

import * as S from "./styles";
import { useEffect, useState } from "react";
import { edgeServerAppPaths } from "next/dist/build/webpack/plugins/pages-manifest-plugin";
import { useGetAllDepartmentsQuery } from "@/store/queries/departmentMangement";
import { useGetAllPositionQuery } from "@/store/queries/positionManagement";

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

  const majorData: InterfaceDepartmentData = useGetAllPositionQuery(undefined, {
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
                HandleEditUser(newRecord, true);
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
                HandleEditUser(newRecord, true);
              }}
            ></Checkbox>
          </Flex>
        );
      },
    },
    {
      title: t("function"),
      key: "action",
      render: (_, record) => {
        return (
          <Flex justify="center" gap={20}>
            <Popconfirm
              title={t("editDepartment.title")}
              description={t("editDepartment.description")}
              okText={t("editDepartment.okText")}
              cancelText={t("editDepartment.cancelText")}
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
    HandleEditUser(newEdit, false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      message.success("Xóa thành công");
    } catch (err) {}
  };
  const HandleEditUser = async (data: any, isfetch: boolean) => {
    try {
      await editUser({
        params: { id: data?._id },
        body: data,
      }).unwrap();
      if (isfetch) refetch();
      message.success("Thay đổi thành công");
    } catch (err) {}
  };

  const handlePageChange = (page: number) => {
    router.push(createQueryString("page", `${page}`));
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
        <Typography.Title level={5}>{t("Search")}</Typography.Title>
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          onChange={handleSearch}
          defaultValue={search}
        />
      </S.FilterWrapper>
      <S.TableWrapper>
        <Table
          columns={columns}
          dataSource={result}
          loading={isFetching}
          pagination={false}
          rowKey={(record) => record._id}
        />
      </S.TableWrapper>
      <Flex justify="flex-end">
        <Pagination
          defaultCurrent={page}
          total={total}
          onChange={handlePageChange}
        />
      </Flex>
    </S.PageWrapper>
  );
}

export default UsersManagementModule;
