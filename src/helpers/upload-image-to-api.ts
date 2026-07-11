import axios from "axios";

import { constants } from "@/settings";
import webStorageClient from "@/utils/webStorageClient";

/**
 * Upload a single image to the Dever API S3 upload endpoint.
 *
 * POST {API_SERVER}/api/v1/upload — multipart field name "image", admin Bearer token.
 * API wraps the result as { data: { url } }, so this returns the public URL string.
 */
export async function uploadImageToApi(
  file: File,
  onProgressPercent?: (percent: number) => void
): Promise<string> {
  const fmData = new FormData();
  fmData.append("image", file);

  const token = webStorageClient.getToken();

  const res = await axios.post(
    `${constants.API_SERVER}/api/v1/upload`,
    fmData,
    {
      headers: {
        "content-type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      onUploadProgress: (event: any) => {
        if (onProgressPercent && event?.total) {
          onProgressPercent((event.loaded / event.total) * 100);
        }
      },
    }
  );

  return res?.data?.data?.url;
}
