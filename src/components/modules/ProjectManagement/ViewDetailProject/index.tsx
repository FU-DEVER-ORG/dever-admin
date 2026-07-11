"use client";

import {
  Flex,
  Form,
  Input,
  Popconfirm,
  Table,
  TableProps,
  Typography,
  Upload,
  message,
} from "antd";
import _ from "lodash";
import {
  useDeleteProjectMutation,
  useEditProjectMutation,
  useGetAllProjectsQuery,
  useGetProjectByIdQuery,
} from "@/store/queries/projectMangement";
import { UploadOutlined } from "@ant-design/icons";
import * as S from "./styles";
import { useParams } from "next/navigation";
import CustomEditor from "@/components/core/common/CustomEditor";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/core/common/Button";
import { uploadImageToApi } from "@/helpers/upload-image-to-api";

interface DataType {
  key: string;
  _id: string;
  name: string;
  constant: string;
}

function ViewDetailProject() {
  const params = useParams();

  const [myForm] = useForm();

  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [editProject] = useEditProjectMutation();

  const { result, isFetching, refetch } = useGetProjectByIdQuery(
    params?.slug as string,
    {
      selectFromResult: ({ data, isFetching }) => {
        return {
          result: data?.data ?? [],
          isFetching,
        };
      },
      skip: !params?.slug,
    }
  );
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

  const handleChangeEditor = (value: string) => {
    myForm.setFieldsValue({ description: value });
  };

  useEffect(() => {
    myForm.setFieldsValue({
      title: result?.title,
      subTitle: result?.subTitle,
      description: result?.description,
    });
    setImageUrl(result?.image);
  }, [
    myForm,
    result?.description,
    result?.image,
    result?.subTitle,
    result?.title,
  ]);

  const handleSubmitForm = async (values: any) => {
    console.log({
      ...values,
      image: imageUrl,
    });

    try {
      await editProject({
        params: { id: result?._id },
        body: {
          ...values,
          image: imageUrl,
        },
      }).unwrap();
      message.success("Sửa thông tin bài viết thành công");
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <S.PageWrapper>
      <S.Head>
        <Typography.Title level={2}>Chỉnh sửa thông tin dự án</Typography.Title>
      </S.Head>
      <Form layout="vertical" form={myForm} onFinish={handleSubmitForm}>
        <Form.Item label="Tên dự án" name={"title"}>
          <Input placeholder="Nhập tên dự án" />
        </Form.Item>
        <Form.Item label="Tiêu đề phụ" name={"subTitle"}>
          <Input placeholder="Nhập tiêu đề phụ" />
        </Form.Item>
        <Form.Item label="Ảnh bìa">
          <S.UploadWrap>
            <Upload.Dragger
              name="file"
              customRequest={handleUpload}
              multiple={false}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload.Dragger>
          </S.UploadWrap>
        </Form.Item>
        {imageUrl && (
          <S.ImageWrapper src={imageUrl} alt="" width={600} height={600} />
        )}
        <Form.Item label="Mô tả" name={"description"}>
          <CustomEditor
            data={result?.description}
            getData={handleChangeEditor}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" $width="100%">
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </S.PageWrapper>
  );
}

export default ViewDetailProject;
