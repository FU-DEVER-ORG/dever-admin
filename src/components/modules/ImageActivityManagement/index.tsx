"use client";

import { useEffect, useState } from "react";
import {
  Flex,
  Image,
  Popconfirm,
  Table,
  TableProps,
  Typography,
  Upload,
  message,
} from "antd";
import { useParams } from "next/navigation";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import _ from "lodash";

import { useTranslation } from "@/app/i18n/client";
import { uploadImageToApi } from "@/helpers/upload-image-to-api";
import {
  useCreateImageMutation,
  useDeleteImageMutation,
  useDeleteManyImagesMutation,
  useGetAllImagesQuery,
} from "@/store/queries/imageActivityManagement";

import Button from "@/components/core/common/Button";

import * as S from "./styles";

interface DataType {
  key: string;
  _id: string;
  url: string;
}

function ImageActivityManagementModule() {
  const params = useParams();

  const { t } = useTranslation(
    params?.locale as string,
    "imageActivityManagement"
  );

  const [imageUrl, setImageUrl] = useState<string>("");
  const [fileList, setFileList] = useState<string[]>([]);
  const [deleteList, setDeleteList] = useState<string[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [deleteImage] = useDeleteImageMutation();
  const [createImage, { isLoading }] = useCreateImageMutation();
  const [deleteManyImages, { isLoading: isLoadingDelete }] =
    useDeleteManyImagesMutation();
  const { result, isFetching, refetch } = useGetAllImagesQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => {
      return {
        result: data?.data?.images ?? [],
        isFetching,
      };
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteImage(id).unwrap();
      message.success("Xóa thành công");
      refetch();
    } catch (error) {}
  };

  const handleAdd = async () => {
    try {
      await createImage(
        fileList?.map((file) => ({
          url: file,
        }))
      ).unwrap();
      message.success("Thêm thành công");
      refetch();
      setFileList([]);
    } catch (error) {}
  };

  const handleUpload = async ({
    onSuccess,
    onError,
    file,
    onProgress,
  }: any) => {
    try {
      setIsUploading(true);
      const url = await uploadImageToApi(file, (percent) =>
        onProgress({ percent })
      );
      onSuccess("Ok");
      setImageUrl(url);
    } catch (err) {
      onError({ error: new Error("Some error") });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteManyImages = async () => {
    try {
      await deleteManyImages(deleteList).unwrap();
      message.success("Xóa thành công");
      refetch();
    } catch (error) {}
  };

  useEffect(() => {
    if (!imageUrl) {
      return;
    }
    setFileList([...fileList, imageUrl]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  useEffect(() => {
    if (!isUploading) {
      messageApi.destroy();
      return;
    }
    messageApi.open({
      type: "loading",
      content: "Wait for upload images...",
      duration: 100,
    });
  }, [isUploading, messageApi]);

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      width: 50,
    },
    {
      title: t("name"),
      dataIndex: "url",
      key: "url",
      render: (_, record) => {
        return <Image src={record?.url} alt="" width={200} />;
      },
    },
    {
      title: t("function"),
      key: "action",
      width: 200,
      render: (_, record) => {
        return (
          <Flex justify="center" gap={20}>
            <Popconfirm
              title={t("deleteSocial.title")}
              description={t("deleteSocial.description")}
              okText={t("deleteSocial.okText")}
              cancelText={t("deleteSocial.cancelText")}
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

  return (
    <>
      {contextHolder}
      <S.PageWrapper>
        <S.Head>
          <Typography.Title level={2}>{t("title")}</Typography.Title>
        </S.Head>
        <Flex justify="space-between" align="flex-start">
          <S.FilterWrapper>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={!fileList.length}
              loading={isLoading}
            >
              {t("addSocial.title")}
            </Button>
            <Upload
              name="file"
              customRequest={handleUpload}
              multiple
              fileList={fileList?.map((file) => ({
                uid: file,
                name: file,
                status: "done",
                url: file,
              }))}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </S.FilterWrapper>
          <Button
            icon={<UploadOutlined />}
            danger
            onClick={handleDeleteManyImages}
          >
            Delete file choosen
          </Button>
        </Flex>

        <S.TableWrapper>
          <Table
            columns={columns}
            dataSource={result}
            loading={isFetching}
            pagination={false}
            rowKey={(record) => record._id}
            rowSelection={{
              type: "checkbox",
              onChange: (_, selectedRows: DataType[]) => {
                setDeleteList(selectedRows.map((row) => row._id));
              },
            }}
          />
        </S.TableWrapper>
      </S.PageWrapper>
    </>
  );
}

export default ImageActivityManagementModule;
