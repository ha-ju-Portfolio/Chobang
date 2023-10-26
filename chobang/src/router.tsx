import { createBrowserRouter } from "react-router-dom";
import { Router as RemixRouter } from "@remix-run/router/dist/router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Main from "./pages/Main";

interface RouterBase {
  id: number; // 페이지 아이디 (반복문용 고유값)
  path: string; // 페이지 경로
  label: string; // 사이드바에 표시할 페이지 이름
  element: React.ReactNode; // 페이지 엘리먼트
  children?: RouterElement[]; // 중첩라우팅에서 인증이 필요한 페이지가 있을경우 처리하기 위해서 RouterBase 에서 RouterElement로 바꿨습니다
  errorElement?: React.ReactNode; // 에러 페이지 엘러먼트
}

interface UserAccessibleRouterElement extends RouterBase {
  withAuth?: boolean; // 인증이 필요한 페이지 여부
}

interface AdminAccessibleRouterElement extends RouterBase {
  withAuth: true; // 인증이 필요한 페이지 여부
  isAdminPage?: boolean; // 어드민 페이지 여부
}

type RouterElement = UserAccessibleRouterElement | AdminAccessibleRouterElement;

const routerData: RouterElement[] = [
  {
    id: 0,
    path: "/",
    label: "Main",
    element: <Main />,
    withAuth: true,
  },
  {
    id: 0,
    path: "/login",
    label: "Login",
    element: <Login />,
    withAuth: false,
  },
  {
    id: 0,
    path: "/signup",
    label: "Signup",
    element: <Signup />,
    withAuth: false,
  },
];

interface RouteObject {
  path: string;
  element: React.ReactNode;
  children?: RouteObject[];
}

//기존 router 코드에는 중첩 라우팅에 대한 처리가 없어서 새로 만들었습니다.
//함수로 분리했으니 혹시 추가하거나 수정할 부분있으면 함수내에서 바로 처리하시면 될 것 같아요.
//router.children가 존재하면 다시 함수를 다시 호출해서 중첩라우팅을 변환합니다. 재귀를 사용했으니 2중3중으로 들어가도 처리가능합니다.
function transformRoutes(routerArray: RouterElement[]): RouteObject[] {
  return routerArray.map((router) => {
    const routeElement = router.withAuth ? (
      <div>{router.element}</div>
    ) : (
      router.element
    );

    const routeObject: RouteObject = {
      path: router.path,
      element: routeElement,
    };

    if (router.children && router.children.length) {
      routeObject.children = transformRoutes(router.children);

      // children에 withAuth가 있는 경우(인증이 필요한 페이지가 있는경우 처리입니당)
      if (router.children.some((child) => child.withAuth)) {
        routeObject.element = <div>{router.element}</div>;
      }
    }

    return routeObject;
  });
}

export const routers: RemixRouter = createBrowserRouter(
  transformRoutes(routerData)
);