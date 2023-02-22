'use client';
import { Uploader } from 'uploader'; // Installed by "react-uploader".
import { UploadButton } from 'react-uploader';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import downloadPhoto from '@/utils/downloadPhoto';

interface IPrediction {
  status: string;
  detail: string;
  id: string;
  output?: string;
  input: any;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<IPrediction | null>(null);
  const [aiProcessingImage, setAIProcessingImage] = useState<boolean>(false);
  const [photoName, setPhotoName] = useState<string | null>(null);

  const uploader = Uploader({
    apiKey: 'public_W142he741xPVfKqi5r5THUPRhmvh', // Get production API keys from Upload.io
  });

  const options = {
    maxFileCount: 1,
    mimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    editor: { images: { crop: false } },
    styles: { colors: { primary: '#000' } },
  };

  const getPhotoPrediction = async (fileUrl: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(true);
    setAIProcessingImage(true);
    const res = await fetch('/api/predictions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: fileUrl }),
    });

    let newPhoto = await res.json();

    setPrediction(newPhoto);
  };

  useEffect(() => {
    let intervalId: string | number | NodeJS.Timeout | undefined;
    const getPredictionData = async (prediction: IPrediction) => {
      const response = await fetch('/api/predictions/' + prediction.id);
      let jsonResponse = await response.json();
      setPrediction(jsonResponse);
      if (
        jsonResponse.status === 'failed' ||
        jsonResponse.status === 'succeeded'
      ) {
        setLoading(false);
        clearInterval(intervalId);
      }
    };
    if (
      (prediction && prediction.status === 'processing') ||
      prediction?.status === 'starting'
    ) {
      intervalId = setInterval(() => getPredictionData(prediction), 2000);
    }
  }, [prediction]);

  return (
    <div
      className='container h-screen pb-14 bg-right bg-cover'
      style={{ backgroundImage: "url('/bg.svg')" }}
    >
      {/* NAV */}
      <div className='w-full container mx-auto p-6'>
        <div className='w-full flex items-center justify-between'>
          <a
            className='flex items-center text-indigo-400 no-underline hover:no-underline font-bold text-2xl lg:text-4xl'
            href='#'
          >
            <svg
              className='h-8 fill-current text-indigo-600 pr-2'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
            >
              <path d='M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm-5.6-4.29a9.95 9.95 0 0 1 11.2 0 8 8 0 1 0-11.2 0zm6.12-7.64l3.02-3.02 1.41 1.41-3.02 3.02a2 2 0 1 1-1.41-1.41z' />
            </svg>{' '}
            RESTORE
          </a>

          <div className='flex w-1/2 justify-end content-center'>
            <a
              className='inline-block text-blue-300 no-underline hover:text-indigo-800 hover:text-underline text-center h-10 p-2 md:h-auto md:p-4'
              data-tippy-content='@twitter_handle'
              href='http://twitter.com/tibaus'
            >
              <svg
                className='fill-current h-6'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 32 32'
              >
                <path d='M30.063 7.313c-.813 1.125-1.75 2.125-2.875 2.938v.75c0 1.563-.188 3.125-.688 4.625a15.088 15.088 0 0 1-2.063 4.438c-.875 1.438-2 2.688-3.25 3.813a15.015 15.015 0 0 1-4.625 2.563c-1.813.688-3.75 1-5.75 1-3.25 0-6.188-.875-8.875-2.625.438.063.875.125 1.375.125 2.688 0 5.063-.875 7.188-2.5-1.25 0-2.375-.375-3.375-1.125s-1.688-1.688-2.063-2.875c.438.063.813.125 1.125.125.5 0 1-.063 1.5-.25-1.313-.25-2.438-.938-3.313-1.938a5.673 5.673 0 0 1-1.313-3.688v-.063c.813.438 1.688.688 2.625.688a5.228 5.228 0 0 1-1.875-2c-.5-.875-.688-1.813-.688-2.75 0-1.063.25-2.063.75-2.938 1.438 1.75 3.188 3.188 5.25 4.25s4.313 1.688 6.688 1.813a5.579 5.579 0 0 1 1.5-5.438c1.125-1.125 2.5-1.688 4.125-1.688s3.063.625 4.188 1.813a11.48 11.48 0 0 0 3.688-1.375c-.438 1.375-1.313 2.438-2.563 3.188 1.125-.125 2.188-.438 3.313-.875z'></path>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* <!--Main--> */}
      {prediction?.status === 'succeeded' && prediction?.output && (
        <div className='p-4  h-screen w-screen flex flex-col gap-8 items-center fade-in'>
          <div className=' flex-col lg:flex-row flex gap-3 justify-center'>
            <div className='p-4 w-80 h-80 lg:w-100 lg:h-100  relative'>
              <Image alt='prediction' fill src={prediction.input.img} />
              <span className='font-semibold text-base text-violet-900'>
                Imagem antiga
              </span>
            </div>
            <div className='p-4 w-80 h-80 lg:w-100 lg:h-100  relative'>
              <Image alt='prediction' fill src={prediction.output} />
              <span className='font-semibold text-base text-violet-900'>
                Imagem processada
              </span>
            </div>
          </div>
          <div className='flex flex-row gap-4'>
            <button
              onClick={() => {
                if (prediction.output) {
                  setPrediction(null);
                  setAIProcessingImage(false);
                  setLoading(false);
                }
              }}
              className='bg-purple-500 hover:bg-purple-700 text-white font-bold p-6 border border-purple-700 rounded'
            >
              Gerar nova imagem
            </button>
            <button
              onClick={() => {
                if (prediction.output) {
                  const name = photoName ? photoName : `${Date.now()}`;
                  downloadPhoto(prediction.output, name);
                }
              }}
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold p-6 border border-blue-700 rounded'
            >
              Baixar imagem
            </button>
          </div>
        </div>
      )}
      {prediction?.status !== 'succeeded' && !loading && (
        <div className='container pt-24 md:pt-48 px-6 mx-auto flex flex-wrap flex-col md:flex-row items-center'>
          {/* <!--Left Col--> */}
          <div className='flex flex-col w-full xl:w-2/5 justify-center lg:items-start overflow-y-hidden'>
            <h1 className='my-4 text-3xl md:text-5xl text-purple-800 font-bold leading-tight text-center md:text-left slide-in-bottom-h1'>
              Restaure/Melhore uma imagem
            </h1>
            <p className='leading-normal text-base md:text-2xl mb-8 text-center md:text-left slide-in-bottom-subtitle'>
              Faça upload da imagem a a inteligência artificial irá retornar ela
              melhorada
            </p>
          </div>

          {/* <!--Right Col--> */}
          <div className='w-full xl:w-3/5 py-6 overflow-y-hidden flex justify-center fade-in'>
            <UploadButton
              uploader={uploader}
              options={options}
              onComplete={(file) => {
                if (file.length !== 0) {
                  setPhotoName(file[0].originalFile.originalFileName);
                  getPhotoPrediction(file[0].fileUrl);
                }
              }}
            >
              {({ onClick }) => (
                <button
                  onClick={onClick}
                  className='bg-blue-500 hover:bg-blue-700 text-white font-bold p-6 border border-blue-700 rounded'
                >
                  Upload da imagem
                </button>
              )}
            </UploadButton>
          </div>
        </div>
      )}

      {loading && (
        <div className='flex items-center flex-col fade-in'>
          <h2 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
            Convertendo sua imagem:
          </h2>
          <ul className='max-w-md space-y-2 text-gray-500 list-inside dark:text-gray-400'>
            <li className='flex items-center'>
              {aiProcessingImage && (
                <div role='status'>
                  <svg
                    aria-hidden='true'
                    className='w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
                    viewBox='0 0 100 101'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                      fill='currentColor'
                    />
                    <path
                      d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                      fill='currentFill'
                    />
                  </svg>
                  <span className='sr-only'>Loading...</span>
                </div>
              )}
              <svg
                aria-hidden='true'
                className='w-5 h-5 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                ></path>
              </svg>
              Upload da imagem para o servidor
            </li>
            <li className='flex items-center'>
              <svg
                aria-hidden='true'
                className='w-5 h-5 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                ></path>
              </svg>
              Upload da imagem para a inteligência artificial
            </li>
            <li className='flex items-center'>
              <div role='status'>
                <svg
                  aria-hidden='true'
                  className='w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
                  viewBox='0 0 100 101'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                    fill='currentColor'
                  />
                  <path
                    d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                    fill='currentFill'
                  />
                </svg>
                <span className='sr-only'>Loading...</span>
              </div>
              Processando imagem
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
